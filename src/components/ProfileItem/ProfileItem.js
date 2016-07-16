import React, { PropTypes } from 'react'

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
        onClick={this.selectProfile}>
        <div className='profile-list-col-header name'>
          {profile.name}
        </div>
      </div>
    )
  }
}

export default ProfileItem
