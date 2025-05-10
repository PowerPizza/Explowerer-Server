import React, { Component } from 'react'
import './targetElement.css'
import { PriorityDownSolid, PriorityUpSolid } from 'iconoir-react'

export default class TargetElement extends Component {
    constructor(){
        super();
        this.state = {isOpened: false};
    }

    toggleOpen = (eve)=>{
        this.setState({isOpened: !this.state.isOpened});
        eve.stopPropagation();
    }
  render() {
    let {target_data, onSelectTarget, selected_target} = this.props;
    return (
      <div className={`client ${selected_target === target_data["sid"] ? 'selected' : ''}`} onClick={onSelectTarget}>
        <div className='primary_info' style={this.state.isOpened ? {borderBottom: "2px solid green", marginBottom: "10px"} : {}}>
            <span className='sid_text'>{target_data["sid"]}</span>
            {this.state.isOpened ? 
            <PriorityUpSolid width={45} height={45} color='#7303fc' onClick={this.toggleOpen} className='drop_down_symbol'/>    
            :
            <PriorityDownSolid width={45} height={45} color='#7303fc' onClick={this.toggleOpen} className='drop_down_symbol'/>
            }
        </div>
        {this.state.isOpened ? 
        <>
            <div className='secondry_info'>
                <span>USER NAME : {target_data["user_name"]}</span>
                <span>MAC ADDR : {target_data["mac_addr"]}</span>
            </div>
        </> : null}
      </div>
    )
  }
}
