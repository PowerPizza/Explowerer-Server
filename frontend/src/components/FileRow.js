import React, { Component } from 'react'
import './fileRow.css'
import { Download, Trash, EmptyPage, Edit } from 'iconoir-react'

export default class FileRow extends Component {
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
        let {file_name, file_size, date_of_creation, onDownloadFile, onDeleteFile, onRenameFile, fileSizeWithUnit} = this.props
        return (
            <div className='file_row_main_body' onMouseEnter={this.on_mouse_hover} onMouseLeave={this.on_mouse_unhover}>
                <EmptyPage width={60} height={60} fill='#ededed' color='#d1d1d1' />
                <div className='bdt1'>
                    <span className='file_name'>{file_name.length > 30 ? file_name.slice(0, 15) + "..." + file_name.slice(-15) : file_name}</span>
                    <span className='file_size'>{fileSizeWithUnit(file_size)}</span>
                </div>
                <div className='bdt2'>
                    {this.state.showMoreOptions ? 
                    <div className='more_options'>
                        <button className='option_ download' onClick={()=>{onDownloadFile(file_name)}}>
                            <Download width={35} height={35} color='#9fff45' strokeWidth={2.3} />
                        </button>
                        <button className='option_ delete' onClick={()=>{onDeleteFile(file_name, "file")}}>
                            <Trash width={35} height={35} color='#fc6565' strokeWidth={2.3} />
                        </button>
                        <button className='option_ rename'>
                            <Edit width={35} height={35} color='#f2ff8c' strokeWidth={2.3} onClick={()=>{onRenameFile(file_name)}} />
                        </button>
                    </div> : null}
                    <span className='file_creation_date'>{date_of_creation}</span>
                </div>
            </div>
        )
    }
}
