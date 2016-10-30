import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { actions as soundActions } from '../redux/modules/Sounds'
import { actions as profileActions } from '../redux/modules/Profiles'
import SoundItem from '../components/SoundItem/SoundItem'
import ReactToolTip from 'react-tooltip'
import Dropzone from 'react-dropzone'
import { SortableContainer, SortableElement } from 'react-sortable-hoc'
import { Howl } from 'howler'
import { toastr } from 'redux-toastr'
import ReactSlider from 'react-slider'

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
    profileActions: PropTypes.object.isRequired,
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
        sparks: '',
        name: '',
        volume: ''
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
      console.log(name)
      if (name.startsWith('tactile tactile|')) {
        const index = name.split('|')[1]
        this.props.profileActions.assignSound(index, currentSound)
      } else {
        switch (name) {
          case 'sicon-pencil':
          case 'sound-list-action edit drag':
            this._edit(currentSound)
            break
          case 'sicon-trash':
          case 'sound-list-action trash drag':
            this._delete(currentSound, oldIndex)
            break
          default:
            this.props.soundActions.sortSounds(oldIndex, newIndex)
        }
      }
    })
  }

  _delete = (currentSound, oldIndex) => {
    const { sound } = this.state
    let s
    let i
    if (!currentSound) s = sound
    if (!oldIndex && oldIndex !== 0) i = this.props.sounds.findIndex(sound => sound.id === s.id)
    else i = oldIndex
    console.log(i)
    this.props.soundActions.removeSound(i)
    if (sound && s.id === sound.id) {
      if (this.state.howl) this.state.howl.stop()
      this.setState({ ...this.state, isPlaying: false, howl: null, sound: null })
    }
  }

  _edit = (sound) => {
    let s
    if (!sound) s = this.state.sound
    else s = sound
    this.setState({
      ...this.state,
      editId: s.id,
      edit_inputs: {
        cooldown: s.cooldown,
        sparks: s.sparks,
        name: s.name,
        volume: s.volume
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
        volume: parseFloat(sound.volume) * 0.01,
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
    const { editId, edit_inputs: { cooldown, sparks, name, volume } } = this.state
    if (!isNumeric(cooldown) || parseInt(cooldown) < 0) {
      toastr.error('Edit Error', 'Cooldown must be a number 0 or greater.')
      return
    }
    if (!isNumeric(sparks) || parseInt(sparks) < 0) {
      toastr.error('Edit Error', 'Sparks must be a number 0 or greater.')
      return
    }
    this.props.soundActions.editSound(editId, cooldown, sparks, name, volume)
    this.cancelEdit()
  }

  cancelEdit = () => {
    this.setState({
      ...this.state,
      editId: null,
      edit_inputs: {
        cooldown: '',
        sparks: '',
        name: '',
        volume: ''
      }
    })
  }

  handlePress = (e) => {
    if (e.key === 'Enter') this.editSound()
  }

  setupEdit = () => {
    this._edit()
  }

  clickDelete = () => {
    this._delete()
  }

  setVolume = (value) => {
    this.updateValue({ target: { name: 'volume', value: value } })
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
          <div className='sound-list-col-headers'>
            <div className='sound-list-col-header cooldown' data-tip='Cooldown'>
              <span className='sicon-stopwatch'></span>
            </div>
            <div className='sound-list-col-header sparks' data-tip='Sparks'>
              <span className='sicon-lightning'></span>
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
                    onKeyPress={this.handlePress}
                    autoFocus
                    value={edit_inputs.cooldown}
                    placeholder='Cooldown' />
                </div>
                <div className='form-input'>
                  <div className='form-label'>Sparks</div>
                  <input
                    type='text'
                    name='sparks'
                    onChange={this.updateValue}
                    onKeyPress={this.handlePress}
                    autoFocus
                    value={edit_inputs.sparks}
                    placeholder='Sparks' />
                </div>
                <div className='form-input'>
                  <div className='form-label'>Name</div>
                  <input
                    type='text'
                    name='name'
                    onChange={this.updateValue}
                    onKeyPress={this.handlePress}
                    value={edit_inputs.name}
                    autoFocus
                    placeholder='Name' />
                </div>
                <div className='form-input'>
                  <div className='form-label'>Volume | <span className='volume'>{edit_inputs.volume}%</span></div>
                  <ReactSlider
                    min={0}
                    max={100}
                    step={2}
                    defaultValue={edit_inputs.volume}
                    className='volume-slider'
                    onChange={this.setVolume} />
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
              data-tip='Drag a sound here to edit it'
              onClick={this.setupEdit}>
              <span className='sicon-pencil'></span>
            </div>
            <div className={`sound-list-action trash ${dragMode ? 'drag' : ''}`}
              data-tip='Drag a sound here to delete it'
              onClick={this.clickDelete}>
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
  soundActions: bindActionCreators(soundActions, dispatch),
  profileActions: bindActionCreators(profileActions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(SoundList)
