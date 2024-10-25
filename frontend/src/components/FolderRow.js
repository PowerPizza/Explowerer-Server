import React, { Component } from 'react'
import './folderRow.css'
import { Folder, Trash, Download, Edit } from 'iconoir-react'

export default class FolderRow extends Component {
    constructor(){
        super();
        this.state = {showMoreOptions: false};
    }

    on_mouse_hover = ()=>{
        this.setState({showMoreOptions: true});
    }
    on_mouse_unhover = ()=>{
        this.setState({showMoreOptions: false});
    }

    render() {
        let {folder_name, date_of_creation, no_of_items, changeDirFunc, onDownloadFolder, onDeleteFolder, onRenameFolder} = this.props;
        return (
            <div className='folder_row_main_body' onClick={()=>{changeDirFunc(folder_name)}} onMouseEnter={this.on_mouse_hover} onMouseLeave={this.on_mouse_unhover}>
                <Folder width={60} height={60} fill='#ffa725' color='#ef6c02' />
                <div className='bdt1'>
                    <span className='folder_name'>{folder_name.length > 40 ? folder_name.slice(0, 30) + "..." + folder_name.slice(31) : folder_name}</span>
                    <span className='folder_items'>{no_of_items} items</span>
                </div>
                <div className='bdt2'>
                    {this.state.showMoreOptions ? 
                    <div className='more_options' onClick={(eve)=>{eve.stopPropagation()}}>
                        <button className='option_ download' onClick={()=>{onDownloadFolder(folder_name)}}>
                            <Download width={35} height={35} color='#9fff45' strokeWidth={2.3} />
                        </button>
                        <button className='option_ delete' onClick={()=>{onDeleteFolder(folder_name, "folder")}}>
                            <Trash width={35} height={35} color='#fc6565' strokeWidth={2.3} />
                        </button>
                        <button className='option_ rename'>
                            <Edit width={35} height={35} color='#f2ff8c' strokeWidth={2.3} onClick={()=>{onRenameFolder(folder_name)}} />
                        </button>
                    </div> : null}
                    <span className='folder_creation_date'>{date_of_creation}</span>
                </div>
            </div>
        )
    }
}
