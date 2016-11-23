import React, { PropTypes } from 'react'
import Ink from '../Ink'

export class ProfileItem extends React.Component {
  static propTypes = {
    index: PropTypes.number.isRequired,
    profile: PropTypes.object.isRequired,
    profileActions: PropTypes.object.isRequired,
    selectProfile: PropTypes.func.isRequired,
    selectedProfile: PropTypes.string.isRequired
  }

  selectProfile = () => {
    this.props.selectProfile(this.props.profile.id)
  }

  render () {
    const { index, profile, selectedProfile } = this.props
    const isSelected = profile.id === selectedProfile
    return (
      <div key={index} className={`profile-item-container ${isSelected ? 'selected' : ''}`}
        onMouseUp={this.selectProfile}>
        <div className='profile-list-col-header lock'>
          {profile.locked
            ? <span className='sicon-lock' />
            : <span className='sicon-unlock' />
          }
        </div>
        <div className='profile-list-col-header name'>
          {profile.name}
        </div>
        <Ink />
      </div>
    )
  }
}

export default ProfileItem
