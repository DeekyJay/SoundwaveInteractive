import { ipcRenderer } from 'electron'
import { auth, checkStatus, updateTokens, getUserInfo, getTokens } from '../utils/Beam'
import { push } from 'react-router-redux'
import analytics from '../utils/analytics'
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
            dispatch(actions.signIn(tokens))
          }
        })
      } else {
        updateTokens(tokens)
        getUserInfo()
        .then(response => {
          const user = response.body
          analytics.init(user.id, getTokens())
          .then(() => {
            dispatch({
              type: constants.SIGN_IN,
              payload: {
                tokens: tokens,
                isAuthenticated: checkStatus(),
                user: user,
                isWaitingForOAuth: false
              }
            })
            dispatch(push('/'))
          })
          .catch(err => {
            dispatch({
              type: 'SIGN_IN_DENIED'
            })
          })
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
      if (tokens.access && tokens.refresh && tokens.expires) {
        dispatch({
          type: 'SIGN_IN_PENDING'
        })
        updateTokens(tokens)
        if (tokens.refresh && !checkStatus()) {
          auth.refresh()
          .then(response => {
            console.log(response)
          })
        }
        getUserInfo()
        .then(response => {
          const user = response.body
          analytics.init(user.id, getTokens())
          .then(() => {
            dispatch({
              type: constants.SET_USER,
              payload: { user: user }
            })
            dispatch({
              type: constants.INITIALIZE,
              payload: {
                tokens: tokens,
                isAuthenticated: checkStatus()
              }
            })
            dispatch(push('/'))
          })
          .catch(err => {
            dispatch({
              type: 'SIGN_IN_DENIED'
            })
          })
        })
      }
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
    const { payload: { isAuthenticated } } = action
    return {
      ...state,
      isAuthenticated: isAuthenticated
    }
  },
  LOGOUT: (state) => {
    return {
      ...initialState,
      initialized: false
    }
  },
  SET_USER: (state, action) => {
    const { payload } = action
    return {
      ...state,
      ...payload
    }
  },
  SIGN_IN_DENIED: (state) => {
    return {
      ...state,
      denied: true
    }
  }
}
// Reducer
export const initialState = {
  initialized: false,
  isAuthenticated: false,
  isWaitingForOAuth: false,
  tokens: '',
  user: {},
  denied: false
}

export default function (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
