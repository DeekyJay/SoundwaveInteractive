import beam from '../utils/Beam'
import storage from 'electron-json-storage'

// Constants
export const constants = {
  INTERACTIVE_INITIALIZE: 'INTERACTIVE_INITIALIZE',
  START_INTERACTIVE: 'START_INTERACTIVE',
  STOP_INTERACTIVE: 'STOP_INTERACTIVE',
  SET_COOLDOWN_OPTION: 'SET_COOLDOWN_OPTION',
  TOGGLE_AUTO_RECONNECT: 'TOGGLE_AUTO_RECONNECT',
  UPDATE_RECONNECTION_TIMEOUT: 'UPDATE_RECONNECTION_TIMEOUT'
}

const syncStorageWithState = (state) => {
  storage.set('interactive', state.storage, (err) => {
    if (err) throw err
  })
}

// Action Creators
export const actions = {
  initialize: (data) => {
    return {
      type: constants.INTERACTIVE_INITIALIZE,
      payload: { loadedState: data }
    }
  },
  setCooldownOption: (option) => {
    return {
      type: constants.SET_COOLDOWN_OPTION,
      payload: {
        cooldownOption: option
      }
    }
  },
  toggleAutoReconnect: () => {
    return (dispatch, getState) => {
      const { interactive: { storage: { useReconnect } } } = getState()
      dispatch({
        type: constants.TOGGLE_AUTO_RECONNECT,
        payload: !useReconnect
      })
    }
  },
  updateReconnectionTimeout: (value) => {
    return {
      type: constants.UPDATE_RECONNECTION_TIMEOUT,
      payload: value
    }
  },
  goInteractive: (reconnect) => {
    return (dispatch, getState) => {
      const { interactive: { isConnected },
        board: { versionId },
        auth: { user: { channel: { id } } }
      } = getState()
      const shouldConnect = !isConnected
      console.log('GO INTERACTIVE', shouldConnect)
      if (shouldConnect) {
        console.log(beam)
        dispatch({
          type: 'GO_INTERACTIVE_PENDING'
        })
        beam.goInteractive(id, versionId)
        .then(res => {
          dispatch({ type: 'GO_INTERACTIVE_FULFILLED' })
        })
        .catch(err => {
          dispatch({ type: 'GO_INTERACTIVE_REJECTED' })
          throw err
        })
      } else {
        dispatch({ type: 'STOP_INTERACTIVE' })
        beam.stopInteractive()
      }
    }
  },
  robotClosedEvent: () => {
    console.log('ROBOT CLOSE EVENT')
    return (dispatch, getState) => {
      const { interactive: { isConnected, storage: { useReconnect, reconnectionTimeout } } } = getState()
      if (useReconnect && isConnected) {
        dispatch({ type: 'STOP_INTERACTIVE' })
        console.log('TIME TO RECONNECT')
        setTimeout(() => { dispatch(actions.goInteractive()) }, reconnectionTimeout)
      }
    }
  }
}
// Action handlers
const ACTION_HANDLERS = {
  INTERACTIVE_INITIALIZE: (state, actions) => {
    const { payload: { loadedState } } = actions
    return {
      ...state,
      storage: {
        ...loadedState
      }
    }
  },
  SET_COOLDOWN_OPTION: (state, actions) => {
    const { payload: { cooldownOption } } = actions
    return {
      ...state,
      storage: {
        ...state.storage,
        cooldownOption: cooldownOption
      }
    }
  },
  TOGGLE_AUTO_RECONNECT: (state, actions) => {
    const { payload } = actions
    return {
      ...state,
      storage: {
        ...state.storage,
        useReconnect: payload
      }
    }
  },
  UPDATE_RECONNECTION_TIMEOUT: (state, actions) => {
    const { payload } = actions
    return {
      ...state,
      storage: {
        ...state.storage,
        reconnectionTimeout: payload
      }
    }
  },
  GO_INTERACTIVE_FULFILLED: (state) => {
    return {
      ...state,
      isConnected: true,
      isConnecting: false
    }
  },
  GO_INTERACTIVE_PENDING: (state) => {
    return {
      ...state,
      isConnecting: true,
      isConnected: false
    }
  },
  GO_INTERACTIVE_REJECTED: (state) => {
    return {
      ...state,
      isConnected: false,
      isConnecting: false
    }
  },
  UPDATE_USER_COUNT: (state, actions) => {
    const { payload: { user_count } } = actions
    return {
      ...state,
      user_count: user_count
    }
  },
  STOP_INTERACTIVE: (state) => {
    return {
      ...state,
      isConnected: false,
      isConnecting: false
    }
  }
}
// Reducer
export const initialState = {
  isConnecting: false,
  isConnected: false,
  user_count: 0,
  storage: {
    cooldownOption: 'dynamic',
    useReconnect: false,
    reconnectionTimeout: 3000
  }
}
export default function (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  let newState
  if (handler) {
    newState = handler(state, action)
    syncStorageWithState(newState)
  } else {
    newState = state
  }
  return newState
}
