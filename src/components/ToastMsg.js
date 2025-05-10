import React, { Component } from 'react'
import './toastMsg.css'

export default class ToastMsg extends Component {
  render() {
    let {msg} = this.props;
    return (
      <div className='toast_msg_main_body'>
        <span className='msg_text'>{msg}</span>
      </div>
    )
  }
}
