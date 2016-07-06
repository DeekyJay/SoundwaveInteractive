import React from 'react'
import { Route, IndexRoute } from 'react-router'
import { push } from 'react-router-redux'
import { UserAuthWrapper } from 'redux-auth-wrapper'

// NOTE: here we're making use of the `resolve.root` configuration
// option in webpack, which allows us to specify import paths as if
// they were from the root of the ~/src directory. This makes it
// very easy to navigate to files regardless of how deeply nested
// your current file is.
import MainAppLayout from 'layouts/MainAppLayout/MainAppLayout'
import '../styles/core.scss'

import LoginView from 'views/LoginView/LoginView'
import BoardView from 'views/BoardView/BoardView'

const UserIsAuthenticated = UserAuthWrapper({
  authSelector: (state) => state.auth, // how to get the user state
  predicate: (auth) => auth.isAuthenticated,
  redirectAction: push, // the redux action to dispatch for redirect
  wrapperDisplayName: 'UserIsAuthenticated' // a nice name for this auth check
})

export default (store) => (
  <Route component={MainAppLayout}>
    <Route component={LoginView} path='login' />
    <Route component={UserIsAuthenticated(BoardView)} path='/' />
  </Route>
)
