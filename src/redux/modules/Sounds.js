import storage from 'electron-json-storage'
import { toastr } from 'redux-toastr'
import _ from 'lodash'
// Constants
export const constants = {
  INITIALIZE: 'INITIALIZE',
  LOAD_SOUNDS: 'LOAD_SOUNDS',
  ADD_SOUNDS: 'ADD_SOUNDS',
  REMOVE_SOUNDS: 'REMOVE_SOUNDS',
  EDIT_SOUND: 'EDIT_SOUND',
  CLEAR_ALL_SOUNDS: 'CLEAR_ALL_SOUNDS',
  ADD_FOLDER_SOUNDS: 'ADD_FOLDER_SOUNDS',
  SORT_SOUNDS: 'SORT_SOUNDS'
}

const syncStorageWithState = (state) => {
  storage.set('sounds', state, (err) => {
    if (err) throw err
  })
}

// Action Creators
export const actions = {
  initialize: (data) => {
    return {
      type: constants.INITIALIZE,
      payload: { loadedState: data }
    }
  },
  addSounds: (files) => {
    return (dispatch, getState) => {
      const state = getState()
      let sounds = Object.assign([], state.sounds.sounds)
      files.map((file) => {
        if (!_.find(sounds, (sound) => { return sound.path === file.path })) {
          let splitName = file.name.split('.')
          let name = ''
          if (splitName.length > 1) {
            delete splitName[splitName.length - 1]
            let tempName = splitName.join('.')
            name = tempName.substring(0, tempName.length - 1)
          } else if (splitName.length === 1) {
            name = splitName[0]
          } else {
            name = file.name
          }
          sounds.push({ name: name, path: file.path, cooldown: state.sounds.default_cooldown })
        } else {
          toastr.warning('Duplicate Detected',
            file.path + ' already exists in your library.')
        }
      })
      dispatch({
        type: constants.ADD_SOUNDS,
        payload: { sounds: sounds }
      })
    }
  },
  sortSounds: (sounds) => {
    return {
      type: constants.SORT_SOUNDS,
      payload: { sounds: sounds }
    }
  }
}
// Action handlers
const ACTION_HANDLERS = {
  INITIALIZE: (state, actions) => {
    const { payload: { loadedState } } = actions
    return {
      ...state,
      ...loadedState
    }
  },
  ADD_SOUNDS: (state, actions) => {
    const { payload: { sounds } } = actions
    return {
      ...state,
      sounds: sounds
    }
  },
  SORT_SOUNDS: (state, actions) => {
    const { payload: { sounds } } = actions
    return {
      ...state,
      sounds: sounds
    }
  }
}
// Reducer
export const initialState = {
  sounds: [],
  default_cooldown: 15
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
