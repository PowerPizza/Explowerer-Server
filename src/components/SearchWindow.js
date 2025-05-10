import React, { Component } from 'react'
import './searchWindow.css'
import { ArrowLeftCircle, ThreeStarsSolid, Xmark } from 'iconoir-react'
import FolderRow from './FolderRow'
import FileRow from './FileRow'

export default class SearchWindow extends Component {
    constructor(){
        super();
        this.state = {cur_search: ""}
    }

    on_start_search = (eve)=>{
        if (eve.key === "Enter"){
            this.setState({cur_search: eve.target.value});
            this.props.onStartSearch(eve.target.value);
        }
    }

    on_clear_search = ()=>{
        document.getElementsByClassName("search_entry")[0].value = "";
        this.setState({cur_search: ""});
        /* Further add search icon when entry is entered, and show cross icon when its searching... */
    }

  render() {
    let {toggleSearch} = this.props;

    return (
      <div className='searchWin_main_body'>
          <div className='top_header'>
            <ArrowLeftCircle width={45} height={45} strokeWidth={2.2} color='cyan' onClick={toggleSearch}/>
            <input type="text" className='search_entry' defaultValue={this.state.cur_search} onKeyUp={this.on_start_search} />
            <Xmark width={45} height={45} strokeWidth={2.2} color='cyan' onClick={this.on_clear_search} />
          </div>
          <div className='file_folder_list'>
            <div className='actual_list'>
              <div className='holder'>
                {/* {this.state.currentMedias.map((ele, idx) => {
                  return ele["type"] === "folder" ?
                    <FolderRow folder_name={ele["name"]} no_of_items={ele["items"]} date_of_creation={ele["creation_date"].slice(0, 16)} key={"folder_element_" + idx} changeDirFunc={this.onChdir} onDownloadFolder={this.onDownloadFolder} onDeleteFolder={this.onDelete} onRenameFolder={this.onRename} />
                    :
                    <FileRow file_name={ele["name"]} file_size={ele["size"]} date_of_creation={ele["creation_date"].slice(0, 16)} key={"file_element_" + idx} onDownloadFile={this.onDownloadFile} onDeleteFile={this.onDelete} onRenameFile={this.onRename} fileSizeWithUnit={this.fileSizeWithUnit} />
                })} */}
              </div>
            </div>
        </div>
      </div>
    )
  }
}
