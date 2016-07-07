import React, { PropTypes } from 'react'

export class SoundItem extends React.Component {
  static propTypes = {
    sound: PropTypes.object.isRequired
  }

  render () {
    const { sound } = this.props
    return (
      <div className='sound-item-container'>
        <div className='sound-list-col-header cooldown'>
          {sound.cooldown}s
        </div>
        <div className='sound-list-col-header name'>
          {sound.name}
        </div>
        <div className='sound-list-col-header folder'>
          <span className='sicon-folder'></span>
        </div>
      </div>
    )
  }
}

export default SoundItem
