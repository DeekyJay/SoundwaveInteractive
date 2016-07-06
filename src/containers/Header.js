import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { actions as authActions } from '../redux/modules/Authentication'
import { actions as appActions } from '../redux/modules/App'

export class Header extends React.Component {

  static propTypes = {
    username: PropTypes.string,
    avatarUrl: PropTypes.string,
    isAuthenticated: PropTypes.bool.isRequired,
    authActions: PropTypes.object.isRequired,
    appActions: PropTypes.object.isRequired
  }

  render () {
    const {
      isAuthenticated, username, avatarUrl,
      authActions: {
        logout
      },
      appActions: {
        minimize,
        maximize,
        close
      }
    } = this.props
    return (
      <div className='header-container'>
        <div className='logo'></div>
        <div className='dead-zone'></div>
        {isAuthenticated
          ? <div className='user-container'>
            <div className='user-image-container'>
              <span className='sicon-user'></span>
              <img src={avatarUrl || ''} />
            </div>
            <div className='user-text'>
              <div className='user-name'>Hi, {username || 'User'}</div>
              <div className='user-logout' onClick={logout}>Logout</div>
            </div>
          </div>
          : null}
        <div className='window-actions'>
          <div className='action minimize' onClick={minimize}>
            <span className='sicon-dash'></span>
          </div>
          <div className='action maximize' onClick={maximize}>
            <span className='sicon-grow'></span>
          </div>
          <div className='action exit' onClick={close}>
            <span className='sicon-cross'></span>
          </div>
        </div>
      </div>
    )
  }
}

/* istanbul ignore next */
const mapStateToProps = (state) => ({
  username: state.auth.user.username,
  avatarUrl: state.auth.user.avatarUrl,
  isAuthenticated: state.auth.isAuthenticated
})

/* istanbul ignore next */
const mapDispatchToProps = (dispatch) => ({
  authActions: bindActionCreators(authActions, dispatch),
  appActions: bindActionCreators(appActions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(Header)
