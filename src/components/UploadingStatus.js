import React, { Component } from 'react'
import './uploadingStatus.css';

export default class UploadingStatus extends Component {
  render() {
    let {max_, value_, file_name, file_size, onCancleUpload} = this.props;
    return (
      <div className='US_main_body'>
        <div className='status_view'>
            <h1 className='text_uploading'>UPLOADING</h1>
            <span>File Name : {file_name}</span>
            <span>File Size : {file_size}</span>
            <br />
            <span className='chunk_details'>Chunk uploaded : {value_}/{max_+1}</span>
            <progress max={max_+1} value={value_} className='upload_progress'></progress>
            <button className='btn_cancle_upload' onClick={onCancleUpload}>Cancle</button>
        </div>
      </div>
    )
  }
}
