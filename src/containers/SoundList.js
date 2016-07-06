import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { actions as soundActions } from '../redux/modules/Sounds'
import ReactToolTip from 'react-tooltip'
import Dropzone from 'react-dropzone'

export class SoundList extends React.Component {

  static propTypes = {
  }

  handleDrop = (files) => {
    files.map((file) => {
      console.log(file.path)
    })
  }

  addSound = () => {
    this.refs.dropzone.open()
  }

  adFolder = () => {
  }

  render () {
    return (
      <div className='sound-list-container'>
        <div className='sound-list-title'>Sounds</div>
        <div className='sound-list-table'>
          <div className='sound-list-search'>
            <span className='sicon-search'></span>
            <input
              className='search-input'
              type='text'
              name='search'
              placeholder='Search'
              onChange={this.filterSounds} />
          </div>
          <div className='sound-list-col-headers'>
            <div className='sound-list-col-header cooldown' data-tip='Cooldown'>
              <span className='sicon-stopwatch'></span>
            </div>
            <div className='sound-list-col-header name'>
              Name
            </div>
            <div className='sound-list-col-header folder' data-tip='Location'>
              <span className='sicon-folder'></span>
            </div>
          </div>
          <div className='sound-list-items'>
            <div className='sound-list-no-sounds'>
              <Dropzone ref='dropzone' onDrop={this.handleDrop} className='drop-zone'
                accept='audio/mp3,audio/ogg,audio/wav,audio/midi'>
                <span>{'You currently don\'t have any sounds.'}</span>
                <span>{'To add a sound, drag it here.'}</span>
                <span>{'You can also import a folder of sounds down below.'}</span>
              </Dropzone>
            </div>
          </div>
          <div className='sound-list-actions'>
            <div className='sound-list-action edit' data-tip='Edit Selected Sound'>
              <span className='sicon-pencil'></span>
            </div>
            <div className='sound-list-action folder' data-tip='Add Sound From Folder' onClick={this.addFolder}>
              <span className='sicon-addfolder'></span>
            </div>
            <div className='sound-list-action add' data-tip='Add Sound' onClick={this.addSound}>
              <span className='sicon-add'></span>
            </div>
          </div>
        </div>
        <ReactToolTip type='light' class='default-tooltip' effect='solid' />
      </div>
    )
  }
}

/* istanbul ignore next */
const mapStateToProps = (state) => ({})

/* istanbul ignore next */
const mapDispatchToProps = (dispatch) => ({
  soundActions: bindActionCreators(soundActions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(SoundList)
