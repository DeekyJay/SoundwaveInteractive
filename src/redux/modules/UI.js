// Constants
export const constants = {
  NAVIGATE: 'NAVIGATE'
}

// Action Creators
export const actions = {
  navigate: (location) => {
    return {
      type: constants.NAVIGATE,
      payload: location
    }
  }
}
// Action handlers
const ACTION_HANDLERS = {
  NAVIGATE: (state, action) => {
    const { payload } = action
    return {
      ...state,
      active: payload
    }
  }
}
// Reducer
export const initialState = {
  active: 'soundboard'
}
export default function (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
