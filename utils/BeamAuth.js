import Promise from 'bluebird'
import authWindow from './OAuthWindow'

import storage from 'electron-json-storage'
import beam from '../beam'

const scopes = ['user:details:self', 'channel:update:self', 'interactive:robot:self', 'interactive:manage:self']
const id = '5f1e2c8924559bd5b7c29d2cb69cae163d4658b1642142cc'
const oAuthOpts = {
  clientId: id
}
const	beamAuth = beam.use('oauth', oAuthOpts)
/* eslint-disable camelcase */
authWindow.setup({
  clientId: id,
  authorizationUrl: beam.buildAddress(beam.urls.public, '/oauth/authorize'),
  tokenUrl: beam.buildAddress(beam.urls.api, '/oauth/token'),
  useBasicAuthorizationHeader: false,
  redirect_uri: 'http://localhost/'
})
/* eslint-enable camelcase */

const checkStatus = function () {
  console.log(beamAuth.tokens)
  return beamAuth.isAuthenticated()
}

const setTokens = function (tokens) {
  beamAuth.setTokens(tokens)
  return tokens
}

const loadTokens = function () {
  return new Promise((resolve, reject) => {
    storage.get('tokens', (error, tokens) => {
      if (error) {
        reject(error)
      }
      resolve(tokens)
    })
  })
}

const saveTokens = function () {
  return new Promise((resolve, reject) => {
    const tokenCopy = Object.assign({}, beamAuth.getTokens())
    // Save it in the same way we get it from the oauth process
    tokenCopy.expires = tokenCopy.expires.getTime() * 1000
    storage.set('tokens', beamAuth.getTokens(), error => {
      if (error) {
        reject(error)
      }
      resolve()
    })
  })
}

const init = function () {
  return loadTokens().then(tokens => {
    return setTokens(tokens)
  }).then(tokens => {
    console.log(checkStatus())
    if (!checkStatus() && tokens.refresh) {
      return beamAuth.refresh()
    }
    return true
  })
}

const authorize = function () {
  return authWindow.authorize({
    scope: scopes.join(' ')
  }).then(tokens => {
    return beamAuth.setTokens({
      access: tokens.access_token,
      refresh: tokens.refresh_token,
      expires: Date.now() + tokens.expires_in * 1000
    })
  }).then(() => {
    return saveTokens()
  })
}

const logIn = function () {
  return authorize()
}

const fetchUser = function () {
  return beam.request('GET', '/users/current')
}

module.exports = {
  init,
  logIn,
  authorize,
  fetchUser,
  checkStatus
}
