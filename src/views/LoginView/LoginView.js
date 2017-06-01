import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { actions } from '../../redux/modules/Authentication'
import { bindActionCreators } from 'redux'
import Ink from '../../components/Ink'
import { shell } from 'electron'

export class LoginView extends React.Component {

  static propTypes = {
    actions: PropTypes.object.isRequired,
    isWaitingForOAuth: PropTypes.bool.isRequired,
    initialized: PropTypes.bool.isRequired,
    isAuthenticated: PropTypes.bool.isRequired,
    denied: PropTypes.bool.isRequired,
    errored: PropTypes.bool.isRequired,
    initializing: PropTypes.bool.isRequired
  }

  signIn = () => {
    this.props.actions.signIn()
  }

  signOut = () => {
    this.props.actions.logout()
  }

  troubleshoot = () => {
    shell.openExternal('https://github.com/DeekyJay/SoundwaveInteractive/wiki#connectivity-issues')
  }

  render () {
    const { isAuthenticated, isWaitingForOAuth, initializing, initialized, denied, errored } = this.props
    const showLogin = !isAuthenticated && !isWaitingForOAuth && !initializing && initialized
    return (
      <div className='login-container'>
        {showLogin
          ? <div className='login-content'>
            <div className='login-text'>
              You're almost there.<br />Login so we can get started!
            </div>
            <div className='login-button' onClick={this.signIn}>
              Login
              <Ink />
            </div>
          </div>
          : <div className='login-content'>
            <div className='loading'></div>
            {!this.props.initializing ? <div className='login-minor-text'>Waiting for Authorization . . .</div> : null}
          </div>}
        {denied
          ? <div className="denied">
            <span>Whoa there! We aren't quite ready for you to use Soundwave Interactive yet!</span>
            <div className='login-button' onClick={this.signOut}>
              Logout
              <Ink />
            </div>
          </div>
          : null}
        {errored
          ? <div className="denied">
            <div>It appears we're having troubles contacting home.</div>
            <br />
            <div style={{ fontSize: '18px', color: 'gray' }}>You may need to allow this application through your firewall!</div>
            <div style={{ fontSize: '18px', color: 'gray' }}>For more information on how to fix this, click below!</div>
            <br />
            <div className='secondary-button' onClick={this.troubleshoot}>
              Troubleshooting Connectivity
              <Ink />
            </div>
            <div className='login-button' onClick={this.signIn}>
              Login
              <Ink />
            </div>
          </div>
          : null}
      </div>
    )
  }
}

/* istanbul ignore next */
const mapStateToProps = (state) => ({
  isWaitingForOAuth: state.auth.isWaitingForOAuth,
  initialized: state.auth.initialized,
  isAuthenticated: state.auth.isAuthenticated,
  denied: state.auth.denied,
  errored: state.auth.errored,
  initializing: state.auth.initializing
})

/* istanbul ignore next */
const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(actions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(LoginView)
