import { remote } from 'electron'
const { BrowserWindow } = remote
const mainWindow = BrowserWindow.getAllWindows()[0]
// Constants
export const constants = {
  APP_ACTION: 'APP_ACTION'
}

// Action Creators
export const actions = {
  minimize: () => {
    mainWindow.minimize()
    return {
      type: constants.APP_ACTION
    }
  },
  maximize: () => {
    if (mainWindow.isMaximized()) mainWindow.unmaximize()
    else mainWindow.maximize()
    return {
      type: constants.APP_ACTION
    }
  },
  close: () => {
    mainWindow.close()
    return {
      type: constants.APP_ACTION
    }
  }
}
// Action handlers
const ACTION_HANDLERS = {
  APP_ACTION: (state) => {
    return {
      ...state
    }
  }
}
// Reducer
export const initialState = {}
export default function (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
