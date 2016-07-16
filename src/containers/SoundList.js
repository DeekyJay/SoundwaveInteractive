import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { actions as soundActions } from '../redux/modules/Sounds'
import SoundItem from '../components/SoundItem/SoundItem'
import ReactToolTip from 'react-tooltip'
import Dropzone from 'react-dropzone'
import { SortableContainer, SortableElement } from 'react-sortable-hoc'
import { Howl } from 'howler'
import { toastr } from 'redux-toastr'

const SortableItem = SortableElement(({index, sound, soundActions, selectSound, selectedSound}) => {
  return (<SoundItem index={index} sound={sound} soundActions={soundActions}
    selectSound={selectSound} selectedSound={selectedSound} />)
})
const SortableList = SortableContainer(({ items, soundActions, selectSound, selectedSound }) => {
  return (
    <span>
      {items.map((value, index) =>
        <SortableItem key={`item-${index}`} index={index}
          sound={value} soundActions={soundActions} selectSound={selectSound}
          selectedSound={selectedSound} />
      )}
    </span>
  )
})

function isNumeric (n) {
  return !isNaN(parseFloat(n)) && isFinite(n)
}

export class SoundList extends React.Component {

  static propTypes = {
    soundActions: PropTypes.object.isRequired,
    sounds: PropTypes.array.isRequired
  }

  constructor (props) {
    super(props)
    this.state = {
      dragMode: false,
      editId: null,
      isPlaying: false,
      howl: null,
      sound: null,
      edit_inputs: {
        cooldown: '',
        name: ''
      }
    }
  }

  handleDrop = (files) => {
    this.props.soundActions.addSounds(files)
  }

  addSound = () => {
    this.refs.dropzone.open()
  }

  onSortStart = ({node, index, collection}, e) => {
    console.log(node.className)
    this.setState({ ...this.state, dragMode: true })
  }

  onSortMove = (e) => {
  }

  onSortEnd = ({ oldIndex, newIndex }, e) => {
    this.setState({ ...this.state, dragMode: false }, () => {
      const name = document.elementFromPoint(e.x, e.y).className
      const currentSound = this.props.sounds[oldIndex]
      const { sound } = this.state
      switch (name) {
        case 'sicon-pencil':
        case 'sound-list-action edit drag':
          this.setState({
            ...this.state,
            editId: currentSound.id,
            edit_inputs: {
              cooldown: currentSound.cooldown,
              name: currentSound.name
            }
          })
          break
        case 'sicon-trash':
        case 'sound-list-action trash drag':
          this.props.soundActions.removeSound(oldIndex)
          if (sound && currentSound.id === sound.id) {
            if (this.state.howl) this.state.howl.stop()
            this.setState({ ...this.state, isPlaying: false, howl: null, sound: null })
          }
          break
        default:
          this.props.soundActions.sortSounds(oldIndex, newIndex)
      }
    })
  }

  selectSound = (sound) => {
    const { howl } = this.state
    if (howl) howl.stop()
    if (!this.state.sound || this.state.sound.id !== sound.id) {
      this.setState({ ...this.state, sound: sound, howl: null, isPlaying: false })
    } else {
      this.setState({ ...this.state, sound: null, howl: null, isPlaying: false })
    }
  }

  playSound = () => {
    const { sound } = this.state
    if (sound) {
      const howl = new Howl({
        urls: [sound.path],
        buffer: true,
        onend: () => {
          this.setState({ ...this.state, isPlaying: false, howl: null })
        }
      })
      this.setState({ ...this.state, isPlaying: true, howl: howl }, () => {
        this.state.howl.play()
      })
    }
  }

  stopSound = () => {
    const { howl } = this.state
    if (howl) {
      this.setState({ ...this.state, isPlaying: false }, () => {
        howl.stop()
      })
    }
  }

  updateValue = (e) => {
    this.setState({
      ...this.state,
      edit_inputs: {
        ...this.state.edit_inputs,
        [e.target.name]: e.target.value
      }
    })
  }

  editSound = () => {
    const { editId, edit_inputs: { cooldown, name } } = this.state
    if (!isNumeric(cooldown) || parseInt(cooldown) < 0) {
      toastr.error('Edit Error', 'Cooldown must be a number 0 or greater.')
      return
    }
    this.props.soundActions.editSound(editId, cooldown, name)
    this.cancelEdit()
  }

  cancelEdit = () => {
    this.setState({
      ...this.state,
      editId: null,
      edit_inputs: {
        cooldown: '',
        name: ''
      }
    })
  }

  render () {
    const {
      sounds,
      soundActions
    } = this.props
    const {
      dragMode,
      isPlaying,
      sound,
      editId,
      edit_inputs
    } = this.state

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
                  selectSound={this.selectSound}
                  selectedSound={sound}
                  onSortEnd={this.onSortEnd}
                  onSortMove={this.onSortMove}
                  onSortStart={this.onSortStart}
                  pressDelay={100} />
                <Dropzone ref='dropzone' onDrop={this.handleDrop} className='drop-zone'
                  accept='audio/mp3,audio/ogg,audio/wav,audio/midi' />
              </div>
              : <div className='sound-list-no-sounds'>
                <Dropzone ref='dropzone' onDrop={this.handleDrop} className='drop-zone'
                  accept='audio/mp3,audio/ogg,audio/wav,audio/midi'>
                  <span>{'You currently don\'t have any sounds.'}</span>
                  <span>{'To add sounds, drag them here.'}</span>
                </Dropzone>
              </div>}
            {editId
              ? <div className='edit-sound-container'>
                <div className='form-input'>
                  <div className='form-label'>Cooldown</div>
                  <input
                    type='text'
                    name='cooldown'
                    onChange={this.updateValue}
                    autoFocus
                    value={edit_inputs.cooldown}
                    placeholder='Cooldown' />
                </div>
                <div className='form-input'>
                  <div className='form-label'>Name</div>
                  <input
                    type='text'
                    name='name'
                    onChange={this.updateValue}
                    value={edit_inputs.name}
                    autoFocus
                    placeholder='Name' />
                </div>
                <button type='button' className='btn btn-primary' onClick={this.editSound}>
                  Save
                </button>
                <button type='button' className='btn btn-secondary' onClick={this.cancelEdit}>
                  Cancel
                </button>
              </div>
              : null}
          </div>
          {sound
            ? <div className='sound-list-player'>
              <div className='sound-list-player-name'>
                {sound.name}
              </div>
              {!isPlaying
                ? <div className='sound-list-player-action play' onClick={this.playSound}>
                  <span className='sicon-play'></span>
                </div>
                : <div className='sound-list-player-action stop' onClick={this.stopSound}>
                  <span className='square'></span>
                </div>}
            </div>
            : null}
          <div className='sound-list-actions'>
            <div className={`sound-list-action edit ${dragMode ? 'drag' : ''}`}
              data-tip='Drag a sound here to edit it'>
              <span className='sicon-pencil'></span>
            </div>
            <div className={`sound-list-action trash ${dragMode ? 'drag' : ''}`}
              data-tip='Drag a sound here to delete it'>
              <span className='sicon-trash'></span>
            </div>
            <div className={`sound-list-action add ${dragMode ? 'disabled' : ''}`}
              data-tip='Add Sound' onClick={this.addSound}>
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
