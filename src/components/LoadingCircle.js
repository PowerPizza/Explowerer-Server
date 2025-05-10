import React, { Component } from 'react'
import './loadingCircle.css'
import loadingCircleGif from '../icons/loading_circle_gif.gif'

export default class LoadingCircle extends Component {
  render() {
    return (
      <div className='loading_circle_main_body'>
        <div className='circle_container'>
            <img src={loadingCircleGif} alt="Loading circle" className='circle' />
        </div>
      </div>
    )
  }
}
