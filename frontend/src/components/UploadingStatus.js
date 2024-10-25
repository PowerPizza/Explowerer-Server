import React, { Component } from 'react'
import './uploadingStatus.css';

export default class UploadingStatus extends Component {
  render() {
    let {max_, value_} = this.props;
    return (
      <div className='US_main_body'>
        <div className='status_view'>
            <h1 className='text_uploading'>UPLOADING</h1>
            <progress max={max_} value={value_} className='upload_progress'></progress>
        </div>
      </div>
    )
  }
}
