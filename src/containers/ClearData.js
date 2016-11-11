import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { actions as soundActions } from '../redux/modules/Sounds'
import { actions as profileActions } from '../redux/modules/Profiles'
import { actions as authActions } from '../redux/modules/Authentication'
import Ink from '../components/Ink/src'

export class ClearData extends React.Component {

  static propTypes = {
    soundActions: PropTypes.object.isRequired,
    profileActions: PropTypes.object.isRequired,
    authActions: PropTypes.object.isRequired
  }

  clearSounds = () => {
    this.props.soundActions.clearAllSounds()
  }

  clearProfiles = () => {
    this.props.profileActions.clearProfiles()
  }

  clearAllData = () => {
    this.clearSounds()
    this.clearProfiles()
    this.props.authActions.clearTokens()
  }

  render () {
    return (
      <div className='clear-data-container'>
        <div className='clear-data-title'>Clear Data</div>
        <div className='clear-data-wrapper'>
          <button type='button' className='btn btn-primary' onClick={this.clearSounds}>
            Clear Sound Library
            <Ink />
          </button>
          <button type='button' className='btn btn-secondary' onClick={this.clearProfiles}>
            Clear Profiles
            <Ink />
          </button>
          <button type='button' className='btn btn-secondary' onClick={this.clearAllData}>
            Clear All Local Data
            <Ink />
          </button>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({

})

const mapDispatchToProps = (dispatch) => ({
  soundActions: bindActionCreators(soundActions, dispatch),
  profileActions: bindActionCreators(profileActions, dispatch),
  authActions: bindActionCreators(authActions, dispatch)
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ClearData)
