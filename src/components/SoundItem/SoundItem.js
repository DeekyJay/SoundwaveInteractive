import React, { PropTypes } from 'react'
import { remote } from 'electron'
import Ink from '../../components/Ink/src'
const { shell } = remote

export class SoundItem extends React.Component {
  static propTypes = {
    index: PropTypes.number.isRequired,
    sound: PropTypes.object.isRequired,
    soundActions: PropTypes.object.isRequired,
    selectSound: PropTypes.func.isRequired,
    selectedSound: PropTypes.object
  }

  openFileLocation = () => {
    shell.showItemInFolder(this.props.sound.path)
  }

  selectSound = (e) => {
    this.props.selectSound(this.props.sound)
  }

  render () {
    const { index, sound, selectedSound } = this.props
    const isSelected = selectedSound && sound.id === selectedSound.id
    return (
      <div key={index} className={`sound-item-container ${isSelected ? 'selected' : ''}`}
        onClick={this.selectSound}>
        <div className='sound-list-col-header cooldown'>
          {sound.cooldown}s
        </div>
        <div className='sound-list-col-header sparks'>
          {sound.sparks}
        </div>
        <div className='sound-list-col-header name'>
          {sound.name}
        </div>
        <div className='sound-list-col-header folder' onClick={this.openFileLocation}>
          <span className='sicon-folder'></span>
        </div>
        <Ink />
      </div>
    )
  }
}

export default SoundItem
