// Constants
// export const constants = { }

// Action Creators
// export const actions = { }
// Action handlers
const ACTION_HANDLERS = { }
// Reducer
export const initialState = {}
export default function (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
