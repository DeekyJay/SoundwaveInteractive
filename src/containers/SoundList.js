import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { actions as soundActions } from '../redux/modules/Sounds'
import SoundItem from '../components/SoundItem/SoundItem'
import ReactToolTip from 'react-tooltip'
import Dropzone from 'react-dropzone'
import { SortableContainer, SortableElement, arrayMove } from 'react-sortable-hoc'

const SortableItem = SortableElement(({sound, soundActions}) => <SoundItem sound={sound} soundActions={soundActions} />)

const SortableList = SortableContainer(({items, soundActions}) => {
  return (
    <span>
      {items.map((value, index) =>
        <SortableItem key={`item-${index}`} index={index} sound={value} soundActions={soundActions} />
      )}
    </span>
  )
})

export class SoundList extends React.Component {

  static propTypes = {
    soundActions: PropTypes.object.isRequired,
    sounds: PropTypes.array.isRequired
  }

  handleDrop = (files) => {
    this.props.soundActions.addSounds(files)
  }

  addSound = () => {
    this.refs.dropzone.open()
  }

  addFolder = () => {
  }

  onSortMove = (e) => {
  }

  onSortEnd = ({ oldIndex, newIndex }, e) => {
    console.log(e)
    console.log(document.elementFromPoint(e.x, e.y))
    const sortedSounds = arrayMove(this.props.sounds, oldIndex, newIndex)
    this.props.soundActions.sortSounds(sortedSounds)
  }

  render () {
    const {
      sounds,
      soundActions
    } = this.props

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
            {sounds && sounds.length
              ? <div className='has-sounds-container'>
                <SortableList
                  items={sounds}
                  soundActions={soundActions}
                  onSortEnd={this.onSortEnd}
                  onSortMove={this.onSortMove}
                  pressDelay={200} />
                <Dropzone ref='dropzone' onDrop={this.handleDrop} className='drop-zone'
                  accept='audio/mp3,audio/ogg,audio/wav,audio/midi' />
              </div>
              : <div className='sound-list-no-sounds'>
                <Dropzone ref='dropzone' onDrop={this.handleDrop} className='drop-zone'
                  accept='audio/mp3,audio/ogg,audio/wav,audio/midi'>
                  <span>{'You currently don\'t have any sounds.'}</span>
                  <span>{'To add a sound, drag it here.'}</span>
                  <span>{'You can also import a folder of sounds down below.'}</span>
                </Dropzone>
              </div>}
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
const mapStateToProps = (state) => ({
  sounds: state.sounds.sounds
})

/* istanbul ignore next */
const mapDispatchToProps = (dispatch) => ({
  soundActions: bindActionCreators(soundActions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(SoundList)
