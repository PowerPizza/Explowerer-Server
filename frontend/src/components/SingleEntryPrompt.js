import React, { Component } from 'react'
import { XmarkCircleSolid, CheckCircleSolid } from 'iconoir-react';
import './singleEntryPrompt.css'

export default class SingleEntryPrompt extends Component {
    constructor(){
        super();
        this.state = {new_name: ""}
    }
    
    on_change_input_val = (eve)=>{
        this.setState({new_name: eve.target.value});
    }
    render() {
        let {msg, onCancleFunc, onOkFunc, placeholder} = this.props;
        return (
            <div className='entry_prompt_main_body'>
                <div className='prompt_container'>
                    <span className='txt_msg'>{msg}</span>
                    <input type="text" className='prompt' placeholder={placeholder} onChange={this.on_change_input_val}/>
                    <div className='options_'>
                        <button className='cancle_btn' onClick={onCancleFunc}>
                            <XmarkCircleSolid width={25} height={25} />
                            <span>cancle</span>
                        </button>

                        <button className='ok_btn' onClick={()=>{onOkFunc(this.state.new_name)}}>
                            <CheckCircleSolid width={25} height={25} />
                            <span>ok</span>
                        </button>

                    </div>
                </div>
            </div>
        )
    }
}
