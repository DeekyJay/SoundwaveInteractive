import beam from '../utils/Beam'
import storage from 'electron-json-storage'
import _ from 'lodash'
import analytics from '../utils/analytics'

// Constants
export const constants = {
  INTERACTIVE_INITIALIZE: 'INTERACTIVE_INITIALIZE',
  START_INTERACTIVE: 'START_INTERACTIVE',
  STOP_INTERACTIVE: 'STOP_INTERACTIVE',
  SET_COOLDOWN_OPTION: 'SET_COOLDOWN_OPTION',
  TOGGLE_AUTO_RECONNECT: 'TOGGLE_AUTO_RECONNECT',
  UPDATE_RECONNECTION_TIMEOUT: 'UPDATE_RECONNECTION_TIMEOUT',
  COOLDOWN_UPDATED: 'COOLDOWN_UPDATED',
  UPDATE_STATIC_COOLDOWN: 'UPDATE_STATIC_COOLDOWN',
  CLEAR_INTERACTIVE: 'CLEAR_INTERACTIVE'
}

let timeout
const syncStorageWithState = (state) => {
  clearTimeout(timeout)
  timeout = setTimeout(() => {
    storage.set('interactive', state.storage, (err) => {
      if (err) {
        console.log('INTERACTIVE', err)
      }
    })
  }, 5000)
}

const getCooldownsForProfile = (id, profiles, sounds, globalCooldown) => {
  let cooldowns = []
  try {
    const profile = _.find(profiles, p => p.id === id)
    profile.sounds.map(s => {
      const sound = _.find(sounds, so => so.id === s)
      if (sound) cooldowns.push(parseInt(sound.cooldown) * 1000)
    })
  } catch (err) {
    // Something happened, set the default amount
    for (let i = 0; i <= 50; i++) {
      cooldowns = []
      cooldowns.push(globalCooldown)
    }
  }
  return cooldowns
}

// Action Creators
export const actions = {
  initialize: (data) => {
    return (dispatch) => {
      dispatch({
        type: constants.INTERACTIVE_INITIALIZE,
        payload: { loadedState: data }
      })
      dispatch(actions.updateCooldown())
    }
  },
  setCooldownOption: (option) => {
    return (dispatch, getState) => {
      dispatch({
        type: constants.SET_COOLDOWN_OPTION,
        payload: {
          cooldownOption: option
        }
      })
      dispatch(actions.updateCooldown())
    }
  },
  updateCooldown: () => {
    return (dispatch, getState) => {
      const { interactive: { storage: { cooldownOption, staticCooldown } },
        profiles: { profiles, profileId }, sounds: { sounds } } = getState()
      const cooldowns = getCooldownsForProfile(profileId, profiles, sounds, staticCooldown)
      beam.setCooldown(cooldownOption, staticCooldown, cooldowns)
      dispatch({ type: constants.COOLDOWN_UPDATED })
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
  goInteractive: () => {
    return (dispatch, getState) => {
      const { interactive: { isConnected },
        board: { versionId },
        auth: { user: { channel: { id } } }
      } = getState()
      const shouldConnect = !isConnected
      if (shouldConnect) {
        dispatch({
          type: 'GO_INTERACTIVE_PENDING'
        })
        beam.goInteractive(id, versionId)
        .then(res => {
          dispatch({ type: 'GO_INTERACTIVE_FULFILLED' })
          analytics.wentInteractive()
        })
        .catch(err => {
          dispatch({ type: 'GO_INTERACTIVE_REJECTED' })
          throw err
        })
      } else {
        dispatch({ type: 'STOP_INTERACTIVE' })
        beam.stopInteractive(id)
      }
    }
  },
  robotClosedEvent: () => {
    return (dispatch, getState) => {
      const { interactive: { isConnected, storage: { useReconnect, reconnectionTimeout } } } = getState()
      if (useReconnect && isConnected) {
        dispatch({ type: 'STOP_INTERACTIVE' })
        setTimeout(() => { dispatch(actions.goInteractive()) }, reconnectionTimeout)
      }
    }
  },
  updateStaticCooldown: (value) => {
    return (dispatch, getState) => {
      dispatch({
        type: constants.UPDATE_STATIC_COOLDOWN,
        payload: { staticCooldown: parseInt(value) }
      })
      dispatch(actions.updateCooldown())
    }
  },
  clearInteractiveSettings: () => {
    return {
      type: constants.CLEAR_INTERACTIVE
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
        ...state.storage,
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
  },
  UPDATE_STATIC_COOLDOWN: (state, action) => {
    const { payload: { staticCooldown } } = action
    return {
      ...state,
      storage: {
        ...state.storage,
        staticCooldown
      }
    }
  },
  CLEAR_INTERACTIVE: (state) => {
    return {
      ...state,
      storage: {
        ...initialState.storage
      }
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
    staticCooldown: 5000,
    useReconnect: true,
    reconnectionTimeout: 3000
  }
}
export default function (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  let newState
  if (handler) {
    newState = handler(state, action)
    if (action.type !== constants.INTERACTIVE_INITIALIZE) syncStorageWithState(newState)
  } else {
    newState = state
  }
  return newState
}
