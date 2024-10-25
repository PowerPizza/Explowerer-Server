import React, { Component } from 'react'
import './downloadingFolderDialog.css'
import { XmarkCircleSolid } from 'iconoir-react';
import loadingCircle from '../icons/loading_circle_gif.gif'

export default class DownloadingFolderDialog extends Component {
  render() {
    let {msg, on_cancle} = this.props;
    return (
      <div className='df_dialog_main_body'>
        <div className='df_dialog_content'>
            <span className='dialog_heading'>{msg}</span>
            <img src={loadingCircle} alt="loading circle" className='circle_'/>
            <h2 className='compressing_txt'>Compressing</h2>
            <span className='note_'>Zipping in progress... This may take a moment if the folder is large or contains large files. Please be patient.</span>
            <button className='cancle_btn' onClick={on_cancle}>
                <XmarkCircleSolid width={25} height={25} />
                cancle
            </button>
        </div>
      </div>
    )
  }
}
