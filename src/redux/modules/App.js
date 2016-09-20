import { remote, ipcRenderer } from 'electron'
import fetch from '../utils/fetch'
const { BrowserWindow } = remote
const mainWindow = BrowserWindow.getAllWindows()[0]
// Constants
export const constants = {
  MINIMIZE: 'MINIMIZE',
  MAXIMIZE: 'MAXIMIZE',
  CLOSE: 'CLOSE',
  FULLSCREEN: 'FULLSCREEN',
  ALWAYS_ON_TOP: 'ALWAYS_ON_TOP',
  CHECK_FOR_UPDATE: 'CHECK_FOR_UPDATE'
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
  },
  checkForUpdate: () => {
    return (dispatch) => {
      ipcRenderer.send('GET_VERSION')
      ipcRenderer.once('GET_VERSION', (event, err, result) => {
        const version = result.version
        fetch.get(`http://localhost:5001/updates/latest?v=${version}`)
        .then(res => {
          console.log(res)
          dispatch({
            type: 'CHECK_FOR_UPDATE',
            payload: {
              hasUpdate: !!res.url,
              url: res.url || null
            }
          })
        })
      })
    }
  },
  update: () => {
    return (dispatch, getState) => {
      const { app: { url } } = getState()
      ipcRenderer.send('UPDATE_APP', { url: url })
      ipcRenderer.once('UPDATE_APP', (event, err, result) => {
        dispatch({
          type: 'UPDATE_APP',
          payload: {
            isUpdating: !!result.isUpdating
          }
        })
      })
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
  },
  CHECK_FOR_UPDATE: (state, action) => {
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
  },
  hasUpdate: false,
  url: null
}
export default function (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
