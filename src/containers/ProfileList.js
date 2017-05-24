import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { actions as profileActions } from '../redux/modules/Profiles'
import ProfileItem from '../components/ProfileItem/ProfileItem'
import Ink from '../components/Ink'
import ReactToolTip from 'react-tooltip'
import { SortableContainer, SortableElement } from 'react-sortable-hoc'
import { toastr } from 'react-redux-toastr'
import _ from 'lodash'

const SortableItem = SortableElement(({index, profile, profileActions, selectProfile, selectedProfile}) => {
  return (<ProfileItem index={index} profile={profile}
    profileActions={profileActions} selectProfile={selectProfile}
    selectedProfile={selectedProfile} />)
})
const SortableList = SortableContainer(({ items, profileActions, selectProfile, selectedProfile }) => {
  return (
    <span>
      {items.map((value, index) =>
        <SortableItem key={`item-${index}`} index={index}
          profile={value} profileActions={profileActions} selectProfile={selectProfile}
          selectedProfile={selectedProfile} />
      )}
    </span>
  )
})

export class ProfileList extends React.Component {

  static propTypes = {
    profiles: PropTypes.array.isRequired,
    profileActions: PropTypes.object.isRequired,
    profileId: PropTypes.string.isRequired,
    tutMode: PropTypes.bool.isRequired,
    tutStep: PropTypes.number
  }

  constructor (props) {
    super(props)
    this.state = {
      dragMode: false,
      editId: null,
      profile: null,
      edit_inputs: {
        name: ''
      }
    }
  }

  onSortStart = ({node, index, collection}, e) => {
    this.setState({ ...this.state, dragMode: true })
  }

  onSortMove = (e) => {
  }

  onSortEnd = ({ oldIndex, newIndex }, e) => {
    if (!document.elementFromPoint(e.x, e.y)) return
    const name = document.elementFromPoint(e.x, e.y).className
    const currentProfile = this.props.profiles[oldIndex]
    const { profileId } = this.props
    switch (name) {
      case 'sicon-pencil':
      case 'profile-list-action edit drag':
        this._edit(currentProfile)
        break
      case 'sicon-trash':
      case 'profile-list-action trash drag':
        if (currentProfile.id === profileId) {
          toastr.warning('Profile In Use', 'You cannot remove a profile currently in user.')
        } else {
          this.props.profileActions.removeProfile(oldIndex)
        }
        break
      default:
        this.props.profileActions.sortProfiles(oldIndex, newIndex)
    }
    this.setState({ ...this.state, dragMode: false })
  }

  _edit = (profile) => {
    const { profiles, profileId } = this.props
    let p
    if (!profile) p = _.find(profiles, p => p.id === profileId)
    else p = profile
    if (!p) return
    this.setState({
      ...this.state,
      editId: p.id,
      edit_inputs: {
        name: p.name
      }
    })
  }

  selectProfile = (profileId) => {
    if (this.props.profileId === profileId) {
      this.props.profileActions.selectProfile('')
    } else {
      this.props.profileActions.selectProfile(profileId)
    }
  }

  addProfile = () => {
    this.setState({ ...this.state, editId: 'add' })
  }

  cancelEdit = () => {
    this.setState({
      ...this.state,
      editId: null,
      edit_inputs: {
        name: ''
      }
    })
  }

  saveProfile = () => {
    const { editId, edit_inputs: { name } } = this.state
    if (editId === 'add') {
      this.props.profileActions.addProfile(name)
    } else {
      this.props.profileActions.editProfile(editId, name)
    }
    this.cancelEdit()
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

  handlePress = (e) => {
    if (e.key === 'Enter') this.saveProfile()
  }

  setupEdit = () => {
    this._edit()
  }

  isDisabled = (step) => {
    const { tutMode, tutStep } = this.props
    if (!tutMode) return null
    return (
      <span className={tutStep !== step ? 'disabled' : ''}></span>
    )
  }

  render () {
    const {
      profiles,
      profileActions,
      profileId
    } = this.props
    const {
      dragMode,
      editId,
      edit_inputs
    } = this.state
    return (
      <div className='profile-list-container'>
        <div className='profile-list-title'>Profiles</div>
        <div className='profile-list-table'>
          <div className='profile-list-col-headers'>
            <div className='profile-list-col-header lock'>
              <span className='sicon-lock' />
            </div>
            <div className='profile-list-col-header name'>
              Name
            </div>
          </div>
          <div className='profile-list-items'>
            {profiles && profiles.length
              ? <div className='has-profile-container'>
                <SortableList
                  items={profiles}
                  profileActions={profileActions}
                  selectProfile={this.selectProfile}
                  selectedProfile={profileId}
                  onSortEnd={this.onSortEnd}
                  onSortMove={this.onSortMove}
                  onSortStart={this.onSortStart}
                  hideSortableGhost
                  lockAxis='y'
                  distance={8} />
              </div>
              : <div className='profile-list-no-profiles'>
                <span>{'You currently don\'t have any profiles.'}</span>
                <span>{'To add a profile, click the add button.'}</span>
              </div>}
            {editId
              ? <div className='edit-profile-container'>
                <div className='form-input'>
                  <div className='form-label'>Name</div>
                  <input
                    type='text'
                    name='name'
                    onChange={this.updateValue}
                    value={edit_inputs.name}
                    onKeyPress={this.handlePress}
                    autoFocus
                    placeholder='Name' />
                </div>
                <button type='button' className='btn btn-primary' onClick={this.saveProfile}>
                  Save
                  <Ink />
                </button>
                <button type='button' className='btn btn-secondary' onClick={this.cancelEdit}>
                  Cancel
                  <Ink />
                </button>
              </div>
              : null}
          </div>
          <div className='profile-list-actions'>
            <div className={`profile-list-action edit ${dragMode ? 'drag' : ''}`}
              data-tip='Drag a profile here to edit the name'
              onClick={this.setupEdit}>
              <span className='sicon-pencil'></span>
              <Ink className='sicon-pencil' />
            </div>
            <div className={`profile-list-action trash ${dragMode ? 'drag' : ''}`}
              data-tip='Drag a profile here to delete it'>
              <span className='sicon-trash'></span>
              <Ink className='sicon-trash' />
            </div>
            <div className={`profile-list-action add ${dragMode ? 'disabled' : ''}`}
              data-tip='Add Profile' onClick={this.addProfile}>
              <span className='sicon-add'></span>
              <Ink />
            </div>
          </div>
        </div>
        <ReactToolTip type='light' class='default-tooltip' effect='solid' />
        {this.isDisabled(3)}
      </div>
    )
  }
}

/* istanbul ignore next */
const mapStateToProps = (state) => ({
  profiles: state.profiles.profiles,
  profileId: state.profiles.profileId,
  tutMode: state.app.tutMode,
  tutStep: state.app.tutStep
})

/* istanbul ignore next */
const mapDispatchToProps = (dispatch) => ({
  profileActions: bindActionCreators(profileActions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(ProfileList)
