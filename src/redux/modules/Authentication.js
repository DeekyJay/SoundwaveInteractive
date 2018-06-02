import {
  ipcRenderer
} from 'electron'
import {
  auth,
  checkStatus,
  updateTokens,
  getUserInfo,
  getTokens
} from '../utils/Beam'
import {
  push
} from 'react-router-redux'

// Constants
export const constants = {
  SIGN_IN: 'SIGN_IN',
  SIGN_OUT: 'SIGN_OUT',
  VALIDATE_TOKEN: 'VALIDATE_TOKEN',
  INITIALIZE: 'INITIALIZE',
  LOGOUT: 'LOGOUT',
  SET_USER: 'SET_USER'
}

// Action Creators
export const actions = {
  signIn: (tokens) => {
    return (dispatch, getState) => {
      if (!tokens) {
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
            updateTokens(tokens)
            dispatch(actions.initialize(getTokens()))
          }
        })
      }
    }
  },
  validateToken: () => {
    return (dispatch, getState) => {}
  },
  initialize: (tokens) => {
    return (dispatch, getState) => {
      if (tokens.access && tokens.refresh && tokens.expires) {
        dispatch({
          type: 'SIGN_IN_PENDING'
        })
        new Promise((resolve, reject) => {
            updateTokens(tokens) // Set Token inside client
            if (tokens.refresh) { // Do the tokens need to be refreshed
              return auth.refresh()
                .then(() => {
                  updateTokens(getTokens())
                  resolve(true)
                })
                .catch(err => {
                  console.log('Refresh Error', err)
                  reject(err)
                  dispatch({
                    type: 'SIGN_IN_ERROR'
                  })
                })
            } else {
              resolve(true)
            }
          })
          .then(() => {
            return getUserInfo()
          })
          .then(response => {
            const user = response.body
            const newTokens = getTokens()
            dispatch({
              type: constants.SET_USER,
              payload: {
                user: user
              }
            })
            dispatch({
              type: constants.INITIALIZE,
              payload: {
                tokens: newTokens,
                isAuthenticated: checkStatus()
              }
            })
            dispatch(push('/'))
          })
      } else {
        dispatch({
          type: constants.INITIALIZE
        })
      }
    }
  },
  logout: (clear = false) => {
    ipcRenderer.send('logout', {
      clear
    })
    return {
      type: constants.LOGOUT
    }
  }
}
// Action handlers
const ACTION_HANDLERS = {
  INITIALIZE: (state, action) => {
    const {
      payload
    } = action
    console.log('INIT', payload)
    return {
      ...state,
      ...payload,
      initialized: true,
      initializing: false,
      errored: false,
      denied: false
    }
  },
  SIGN_IN: (state, action) => {
    const {
      payload
    } = action
    return {
      ...state,
      ...payload,
      errored: false,
      denied: false
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
    const {
      payload: {
        isAuthenticated
      }
    } = action
    return {
      ...state,
      isAuthenticated: isAuthenticated
    }
  },
  LOGOUT: (state) => {
    return {
      ...initialState,
      initializing: false,
      initialized: true
    }
  },
  SET_USER: (state, action) => {
    const {
      payload
    } = action
    return {
      ...state,
      ...payload
    }
  },
  SIGN_IN_DENIED: (state) => {
    return {
      ...state,
      denied: true,
      errored: false
    }
  },
  SIGN_IN_ERROR: (state) => {
    return {
      ...state,
      errored: true
    }
  }
}
// Reducer
export const initialState = {
  initialized: false,
  initializing: true,
  isAuthenticated: false,
  isWaitingForOAuth: false,
  tokens: '',
  user: {},
  denied: false,
  errored: false
}

export default function (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
