import React, { Component } from 'react'
import './okayCancleDialog.css'
import { CheckCircleSolid, XmarkCircleSolid } from 'iconoir-react'

export default class OkayCancleDialog extends Component {
    render() {
        let {onCancleFunc, onOkFunc, msg} = this.props;
        return (
            <div className='okay_cancle_dialog'>
                <div className='dialog_container'>
                    <span className='txt_msg'>{msg}</span>
                    <div className='options_'>
                        <button className='cancle_btn' onClick={onCancleFunc}>
                            <XmarkCircleSolid width={25} height={25}/>
                            <span>cancle</span>
                        </button>

                        <button className='ok_btn' onClick={onOkFunc}>
                            <CheckCircleSolid width={25} height={25}/>
                            <span>ok</span>
                        </button>

                    </div>
                </div>
            </div>
        )
    }
}
