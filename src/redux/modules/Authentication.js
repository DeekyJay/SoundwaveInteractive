import { ipcRenderer } from 'electron'
import Beam from 'beam-client-node'
import storage from 'electron-json-storage'
import { push } from 'react-router-redux'
const oAuthOpts = {
  clientId: '50b52c44b50315edb7da13945c35ff5a34bdbc6a05030abe'
}
// Constants
export const constants = {
  SIGN_IN: 'SIGN_IN',
  SIGN_OUT: 'SIGN_OUT',
  VALIDATE_TOKEN: 'VALIDATE_TOKEN',
  INITIALIZE: 'INITIALIZE',
  LOGOUT: 'LOGOUT',
  SET_USER: 'SET_USER'
}

function checkStatus (beamAuth) {
  console.log(beamAuth.isAuthenticated()
  ? '########### User is Authenticated ###########'
  : '########### User Auth FAILED ###########')
  return beamAuth.isAuthenticated()
}

function getUserInfo (beam) {
  return beam.request('GET', '/users/current')
  .then(response => {
    return response
  })
}

function setTokens (beamAuth, tokens) {
  const newTokens = {
    access: tokens.access_token || tokens.access,
    refresh: tokens.refresh_token || tokens.refresh,
    expires: tokens.expires_in
      ? Date.now() + tokens.expires_in * 1000
      : tokens.expires
  }
  beamAuth.setTokens(newTokens)
  storage.set('tokens', beamAuth.getTokens())
  return { beam_auth: beamAuth, tokens: newTokens }
}

// Action Creators
export const actions = {
  signIn: (tokens) => {
    return (dispatch, getState) => {
      let { auth: { beam, beam_auth } } = getState()
      if (!tokens) {
        console.log('Open Window')
        ipcRenderer.send('auth')
        dispatch({
          type: 'SIGN_IN_PENDING'
        })
        ipcRenderer.once('auth', (event, tokens) => {
          if (!tokens) {
            dispatch({
              type: 'SIGN_IN_REJECTED'
            })
          } else {
            dispatch(actions.signIn(tokens))
          }
        })
      } else {
        setTokens(beam_auth, tokens)
        // beam_auth = res.beam_auth
        // tokens = res.tokens
        getUserInfo(beam)
        .then(response => {
          const user = response.body
          dispatch({
            type: constants.SIGN_IN,
            payload: {
              tokens: tokens,
              isAuthenticated: checkStatus(beam_auth),
              beam_auth: beam_auth,
              user: user,
              isWaitingForOAuth: false
            }
          })
          dispatch(push('/'))
        })
      }
    }
  },
  validateToken: () => {
    return (dispatch, getState) => {
    }
  },
  initialize: (tokens) => {
    return (dispatch) => {
      const beam = new Beam()
      let beamAuth = beam.use('oauth', oAuthOpts)
      console.log(beamAuth)
      if (tokens.access && tokens.refresh && tokens.expires) {
        setTokens(beamAuth, tokens)
        if (tokens.refresh && !checkStatus(beamAuth)) {
          beamAuth.refresh()
          .then(response => {
            console.log(response)
          })
        }
        getUserInfo(beam)
        .then(response => {
          const user = response.body
          dispatch({
            type: constants.SET_USER,
            payload: { user: user }
          })
          dispatch(push('/'))
        })
      }
      console.log(beamAuth)
      dispatch({
        type: constants.INITIALIZE,
        payload: {
          tokens: tokens,
          beam: beam,
          beam_auth: beamAuth,
          isAuthenticated: checkStatus(beamAuth)
        }
      })
    }
  },
  logout: () => {
    ipcRenderer.send('logout')
    return {
      type: constants.LOGOUT
    }
  }
}
// Action handlers
const ACTION_HANDLERS = {
  INITIALIZE: (state, action) => {
    const { payload } = action
    return {
      ...state,
      ...payload,
      initialized: true
    }
  },
  SIGN_IN: (state, action) => {
    const { payload } = action
    return {
      ...state,
      ...payload
    }
  },
  SIGN_IN_PENDING: (state) => {
    return {
      ...state,
      isWaitingForOAuth: true
    }
  },
  SIGN_IN_REJECTED: (state) => {
    return {
      ...state,
      isWaitingForOAuth: false
    }
  },
  VALIDATE_TOKEN: (state, action) => {
    const { payload: { beam_auth, isAuthenticated } } = action
    return {
      ...state,
      beam_auth: beam_auth,
      isAuthenticated: isAuthenticated
    }
  },
  LOGOUT: (state) => {
    return {
      ...initialState,
      beam: state.beam,
      beam_auth: state.beam_auth,
      initialized: true
    }
  },
  SET_USER: (state, action) => {
    const { payload } = action
    return {
      ...state,
      ...payload
    }
  }
}
// Reducer
export const initialState = {
  initialized: false,
  isAuthenticated: false,
  isWaitingForOAuth: false,
  tokens: '',
  beam: null,
  beam_auth: null,
  user: {}
}

export default function (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
