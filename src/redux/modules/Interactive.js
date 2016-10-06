import beam from '../utils/Beam'

// Constants
export const constants = {
  START_INTERACTIVE: 'START_INTERACTIVE',
  STOP_INTERACTIVE: 'STOP_INTERACTIVE',
  SET_COOLDOWN_OPTION: 'SET_COOLDOWN_OPTION'
}

// Action Creators
export const actions = {
  setCooldownOption: (option) => {
    return {
      type: constants.SET_COOLDOWN_OPTION,
      payload: {
        cooldownOption: option
      }
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
        console.log(beam)
        beam.goInteractive(id, versionId)
      }
    }
  }
}
// Action handlers
const ACTION_HANDLERS = {
  SET_COOLDOWN_OPTION: (state, actions) => {
    const { payload: { cooldownOption } } = actions
    return {
      ...state,
      cooldownOption: cooldownOption
    }
  }
}
// Reducer
export const initialState = {
  cooldownOption: 'dynamic',
  isConnecting: false,
  isConnected: false
}
export default function (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
