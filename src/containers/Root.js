import React, { PropTypes } from 'react'
import { Provider, connect } from 'react-redux'
import { Router } from 'react-router'
import ReduxToastr from 'redux-toastr'
import { bindActionCreators } from 'redux'
import storage from 'electron-json-storage'
import { actions as authActions } from '../redux/modules/Authentication'

/* istanbul ignore next */
class Root extends React.Component {
  static propTypes = {
    history: PropTypes.object.isRequired,
    routes: PropTypes.element.isRequired,
    store: PropTypes.object.isRequired,
    authActions: PropTypes.object.isRequired
  };

  get content () {
    return (
      <Router history={this.props.history}>
        {this.props.routes}
      </Router>
    )
  }

  get devTools () {
    if (__DEBUG__) {
      if (__DEBUG_NEW_WINDOW__) {
        if (!window.devToolsExtension) {
          require('../redux/utils/createDevToolsWindow').default(this.props.store)
        } else {
          window.devToolsExtension.open()
        }
      } else if (!window.devToolsExtension) {
        const DevTools = require('containers/DevTools').default
        return <DevTools />
      }
    }
  }

  componentWillMount () {
    new Promise((resolve, reject) => {
      storage.get('tokens', (error, tokens) => {
        if (error) reject(error)
        resolve(tokens)
      })
    })
    .then(tokens => {
      this.props.authActions.initialize(tokens)
    })
  }

  render () {
    return (
      <Provider store={this.props.store}>
        <div style={{ height: '100%' }}>
            {this.content}
          {this.devTools}
          <ReduxToastr
            timeOut={3000}
            newestOnTop={false}
            position='top-right' />
        </div>
      </Provider>
    )
  }
}

/* istanbul ignore next */
const mapStateToProps = (state) => ({
  auth: state.auth
})

/* istanbul ignore next */
const mapDispatchToProps = (dispatch) => ({
  authActions: bindActionCreators(authActions, dispatch)
})
export default connect(mapStateToProps, mapDispatchToProps)(Root)
