import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { actions } from '../../redux/modules/Authentication'
import { bindActionCreators } from 'redux'

export class LoginView extends React.Component {

  static propTypes = {
    actions: PropTypes.object.isRequired,
    isWaitingForOAuth: PropTypes.bool.isRequired,
    initialized: PropTypes.bool.isRequired
  }

  signIn = () => {
    this.props.actions.signIn()
  }

  render () {
    return (
      <div className='login-container'>
        {!this.props.isWaitingForOAuth && !this.props.initialized
          ? <div className='login-content'>
            <div className='login-text'>
              You're almost there.<br />Login so we can get started!
            </div>
            <div className='login-button' onClick={this.signIn}>Login</div>
          </div>
          : <div className='login-content'>
            <div className='loading'></div>
            <div className='login-minor-text'>Waiting for Authorization . . .</div>
          </div>}
      </div>
    )
  }
}

/* istanbul ignore next */
const mapStateToProps = (state) => ({
  isWaitingForOAuth: state.auth.isWaitingForOAuth,
  initialized: state.auth.initialized
})

/* istanbul ignore next */
const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(actions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(LoginView)
