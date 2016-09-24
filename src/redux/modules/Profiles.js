import storage from 'electron-json-storage'
import { toastr } from 'redux-toastr'
import _ from 'lodash'
import cuid from 'cuid'
import { arrayMove } from 'react-sortable-hoc'
import DevLabUtil from '../utils/DevLabUtil'

// Constants
export const constants = {
  PROFILES_INITIALIZE: 'PROFILES_INITIALIZE',
  ADD_PROFILE: 'ADD_PROFILE',
  REMOVE_PROFILE: 'REMOVE_PROFILE',
  EDIT_PROFILE: 'EDIT_PROFILE',
  SORT_PROFILES: 'SORT_PROFILES',
  CLEAR_ALL_PROFILES: 'CLEAR_ALL_PROFILES',
  SELECT_PROFILE: 'SELECT_PROFILE',
  ASSIGN_SOUNDS: 'ASSIGN_SOUNDS'
}

const syncStorageWithState = (state) => {
  storage.set('profiles', state, (err) => {
    if (err) throw err
  })
}

// Action Creators
export const actions = {
  initialize: (data) => {
    return {
      type: constants.PROFILES_INITIALIZE,
      payload: { loadedState: data }
    }
  },
  addProfile: (name) => {
    return (dispatch, getState) => {
      const { profiles: { profiles } } = getState()
      let newProfiles = Object.assign([], profiles)
      const newProfile = DevLabUtil.createProfile(cuid(), name)
      newProfiles.push(newProfile)
      dispatch({
        type: constants.ADD_PROFILE,
        payload: { profiles: newProfiles }
      })
    }
  },
  sortProfiles: (oldIndex, newIndex) => {
    return (dispatch, getState) => {
      const { profiles: { profiles } } = getState()
      const sortedProfiles = arrayMove(profiles, oldIndex, newIndex)
      dispatch({
        type: constants.SORT_PROFILES,
        payload: { profiles: sortedProfiles }
      })
    }
  },
  removeProfile: (index) => {
    return (dispatch, getState) => {
      const { profiles: { profiles } } = getState()
      const newProfiles = Object.assign([], profiles)
      const removeProfile = newProfiles.splice(index, 1)
      toastr.success(removeProfile[0].name + ' Removed!')
      dispatch({
        type: constants.REMOVE_PROFILE,
        payload: { profiles: newProfiles }
      })
    }
  },
  editProfile: (id, name) => {
    return (dispatch, getState) => {
      const { profiles: { profiles } } = getState()
      const newProfiles = Object.assign([], profiles)
      newProfiles.map((profile) => {
        if (profile.id === id) {
          profile.name = name
        }
      })
      toastr.success('Profile Updated!')
      dispatch({
        type: constants.EDIT_PROFILE,
        payload: { profiles: newProfiles }
      })
    }
  },
  selectProfile: (profileId) => {
    return {
      type: constants.SELECT_PROFILE,
      payload: { profileId: profileId }
    }
  },
  assignSound: (index, sound) => {
    console.log(index, sound)
    return (dispatch, getState) => {
      const { profiles: { profileId, profiles } } = getState()
      let newProfiles = Object.assign([], profiles)
      let idx = 0
      let profile = _.find(profiles, (p, i) => {
        if (p.id === profileId) {
          idx = i
          return true
        }
      })
      let newSounds = Object.assign([], profile.sounds)
      newSounds[index] = sound.id
      console.log(newSounds)
      profile.sounds = newSounds
      newProfiles.splice(idx, 1, profile)
      console.log(newProfiles)
      dispatch({
        type: constants.ASSIGN_SOUNDS,
        payload: { profiles: newProfiles }
      })
    }
  }
}
// Action handlers
const ACTION_HANDLERS = {
  PROFILES_INITIALIZE: (state, actions) => {
    const { payload: { loadedState } } = actions
    return {
      ...state,
      ...loadedState
    }
  },
  ADD_PROFILE: (state, actions) => {
    const { payload: { profiles } } = actions
    return {
      ...state,
      profiles: profiles
    }
  },
  SORT_PROFILES: (state, actions) => {
    const { payload: { profiles } } = actions
    return {
      ...state,
      profiles: profiles
    }
  },
  REMOVE_PROFILE: (state, actions) => {
    const { payload: { profiles } } = actions
    return {
      ...state,
      profiles: profiles
    }
  },
  EDIT_PROFILE: (state, actions) => {
    const { payload: { profiles } } = actions
    return {
      ...state,
      profiles: profiles
    }
  },
  SELECT_PROFILE: (state, actions) => {
    const { payload: { profileId } } = actions
    return {
      ...state,
      profileId: profileId
    }
  },
  ASSIGN_SOUNDS: (state, actions) => {
    const { payload: { profiles } } = actions
    return {
      ...state,
      profiles: profiles
    }
  }
}
// Reducer
export const initialState = {
  profiles: [],
  profileId: ''
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
