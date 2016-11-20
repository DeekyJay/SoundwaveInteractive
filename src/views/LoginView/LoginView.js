import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { actions } from '../../redux/modules/Authentication'
import { bindActionCreators } from 'redux'
import Ink from '../../components/Ink/src'

export class LoginView extends React.Component {

  static propTypes = {
    actions: PropTypes.object.isRequired,
    isWaitingForOAuth: PropTypes.bool.isRequired,
    initialized: PropTypes.bool.isRequired,
    isAuthenticated: PropTypes.bool.isRequired,
    denied: PropTypes.bool.isRequired
  }

  signIn = () => {
    this.props.actions.signIn()
  }

  signOut = () => {
    this.props.actions.logout()
  }

  render () {
    return (
      <div className='login-container'>
        {!this.props.isAuthenticated && !this.props.isWaitingForOAuth && !this.props.initialized
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
            <div className='login-minor-text'>Waiting for Authorization . . .</div>
          </div>}
        {this.props.denied
          ? <div className="denied">
            <span>Whoa there! We aren't quite ready for you to use Soundwave Interactive yet!</span>
            <div className='login-button' onClick={this.signOut}>
              Logout
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
  denied: state.auth.denied
})

/* istanbul ignore next */
const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(actions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(LoginView)
