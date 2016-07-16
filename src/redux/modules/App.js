import { remote } from 'electron'
const { BrowserWindow } = remote
const mainWindow = BrowserWindow.getAllWindows()[0]
// Constants
export const constants = {
  MINIMIZE: 'MINIMIZE',
  MAXIMIZE: 'MAXIMIZE',
  CLOSE: 'CLOSE',
  FULLSCREEN: 'FULLSCREEN',
  ALWAYS_ON_TOP: 'ALWAYS_ON_TOP'
}

// Action Creators
export const actions = {
  minimize: () => {
    mainWindow.minimize()
    return {
      type: constants.MINIMIZE
    }
  },
  maximize: (flag) => {
    console.log(flag)
    if (flag || !mainWindow.isMaximized()) mainWindow.maximize()
    else mainWindow.unmaximize()
    return {
      type: constants.MAXIMIZE,
      payload: { maximized: mainWindow.isMaximized() }
    }
  },
  close: () => {
    mainWindow.close()
    return {
      type: constants.CLOSE
    }
  },
  fullscreen: (flag) => {
    flag
      ? mainWindow.setFullScreen(flag)
      : mainWindow.setFullScreen(!mainWindow.isFullScreen())
    return {
      type: constants.FULLSCREEN,
      payload: { fullscreen: mainWindow.isFullScreen() }
    }
  },
  alwaysOnTop: (flag) => {
    flag
      ? mainWindow.setAlwaysOnTop(flag)
      : mainWindow.setAlwaysOnTop(!mainWindow.isAlwaysOnTop())
    return {
      type: constants.ALWAYS_ON_TOP,
      payload: { alwaysOnTop: mainWindow.isAlwaysOnTop() }
    }
  }
}
// Action handlers
const ACTION_HANDLERS = {
  MINIMIZE: (state) => {
    return {
      ...state
    }
  },
  MAXIMIZE: (state, action) => {
    const { payload } = action
    return {
      ...state,
      ...payload
    }
  },
  CLOSE: (state) => {
    return {
      ...state
    }
  },
  FULLSCREEN: (state, action) => {
    const { payload } = action
    return {
      ...state,
      ...payload
    }
  },
  ALWAYS_ON_TOP: (state, action) => {
    const { payload } = action
    return {
      ...state,
      ...payload
    }
  }
}
// Reducer
export const initialState = {
  window: {
    maximized: mainWindow.isMaximized(),
    fullscreen: mainWindow.isFullScreen(),
    alwaysOnTop: mainWindow.isAlwaysOnTop()
  }
}
export default function (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
