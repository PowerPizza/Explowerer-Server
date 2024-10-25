import React, { Component } from 'react'
import './messageBox.css'
import { MessageText } from 'iconoir-react'

export default class MessageBox extends Component {
  render() {
    let {msg} = this.props;
    return (
      <div className='msg_box_main_body'>
        <MessageText width={60} height={60} fill='white' className='message_icon'/>
        <span>{msg}</span>
      </div>
    )
  }
}
