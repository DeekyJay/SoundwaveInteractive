import { remote, ipcRenderer } from 'electron'
import _ from 'lodash'
import storage from 'electron-json-storage'
import { Howler } from 'howler'
import { shareAnalytics } from '../utils/analytics'

const { BrowserWindow, Tray, Menu, nativeImage, app } = remote
const mainWindow = BrowserWindow.getAllWindows()[0]

// Constants
export const constants = {
  MINIMIZE: 'MINIMIZE',
  MAXIMIZE: 'MAXIMIZE',
  CLOSE: 'CLOSE',
  FULLSCREEN: 'FULLSCREEN',
  ALWAYS_ON_TOP: 'ALWAYS_ON_TOP',
  CHECK_FOR_UPDATE: 'CHECK_FOR_UPDATE',
  UPDATE_READY: 'UPDATE_READY',
  INSTALL_UPDATE: 'INSTALL_UPDATE',
  GET_AUDIO_DEVICES: 'GET_AUDIO_DEVICES',
  SET_AUDIO_DEVICE: 'SET_AUDIO_DEVICE',
  SET_GLOBAL_VOLUME: 'SET_GLOBAL_VOLUME',
  APP_INITIALIZE: 'APP_INITIALIZE',
  TOGGLE_ANALYTICS: 'TOGGLE_ANALYTICS',
  UPDATE_TUT: 'UPDATE_TUT',
  CLEAR_APP: 'CLEAR_APP',
  TOGGLE_TRAY: 'TOGGLE_TRAY'
}

ipcRenderer.on('browser-window-focus', function () {
  document.body.classList.remove('blurred')
})

ipcRenderer.on('browser-window-blur', function () {
  document.body.classList.add('blurred')
})

let ipcDispatch
ipcRenderer.on('UPDATE_READY', function () {
  ipcDispatch(actions.updateReady())
})

let timeout
const syncStorageWithState = (state) => {
  clearTimeout(timeout)
  timeout = setTimeout(() => {
    const data = {
      globalVolume: state.globalVolume,
      selectedOutput: state.selectedOutput,
      shareAnalytics: state.shareAnalytics,
      tutMode: state.tutMode,
      tutStep: state.tutStep,
      trayMinimize: state.trayMinimize
    }
    storage.set('app', data, (err) => {
      if (err) throw err
    })
  }, 5000)
}

// Action Creators
export const actions = {
  initialize: (data) => {
    return (dispatch) => {
      if (data.shareAnalytics !== undefined &&
        data.shareAnalytics !== null) shareAnalytics(data.shareAnalytics)
      ipcDispatch = dispatch
      console.log(data)
      dispatch({
        type: constants.APP_INITIALIZE,
        payload: data
      })
    }
  },
  minimize: () => {
    return (dispatch, getState) => {
      const { app: { trayMinimize } } = getState()
      if (trayMinimize) {
        ipcRenderer.send('GET_TRAY_ICON')
        ipcRenderer.on('GET_TRAY_ICON', (event) => {
          mainWindow.hide()
          app.dock.hide()
          dispatch({
            type: constants.MINIMIZE
          })
        })
      } else {
          mainWindow.minimize()
          dispatch({
            type: constants.MINIMIZE
          })
      }
    }
  },
  maximize: (flag) => {
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
    ipcRenderer.send('CHECK_FOR_UPDATE')
    return {
      type: constants.CHECK_FOR_UPDATE
    }
  },
  updateReady: () => {
    return {
      type: constants.UPDATE_READY
    }
  },
  update: () => {
    ipcRenderer.send('INSTALL_UPDATE')
    return {
      type: constants.INSTALL_UPDATE
    }
  },
  getAudioDevices: () => {
    return (dispatch, getState) => {
      navigator.mediaDevices.enumerateDevices()
      .then(devices => {
        const audioOutputs = _.filter(devices, d => d.kind === 'audiooutput')
        dispatch({
          type: constants.GET_AUDIO_DEVICES,
          payload: { outputs: audioOutputs }
        })
      })
      .catch(err => {
        console.log(err)
      })
    }
  },
  setAudioDevice: (id) => {
    return {
      type: constants.SET_AUDIO_DEVICE,
      payload: { id: id }
    }
  },
  setGlobalVolume: (volume) => {
    Howler.volume(parseFloat(volume) * 0.01)
    return {
      type: constants.SET_GLOBAL_VOLUME,
      payload: { globalVolume: volume }
    }
  },
  toggleAnalytics: () => {
    return (dispatch, getState) => {
      const { app: { shareAnalytics: flag } } = getState()
      shareAnalytics(!flag)
      dispatch({
        type: constants.TOGGLE_ANALYTICS,
        payload: { shareAnalytics: !flag }
      })
    }
  },
  nextTutStep: () => {
    return (dispatch, getState) => {
      const { app: { tutStep } } = getState()
      if (tutStep === 6) {
        dispatch({
          type: constants.UPDATE_TUT,
          payload: {
            tutStep: 1,
            tutMode: false
          }
        })
      } else {
        dispatch({
          type: constants.UPDATE_TUT,
          payload: {
            tutStep: tutStep + 1
          }
        })
      }
    }
  },
  clearAppSettings: () => {
    return {
      type: constants.CLEAR_APP
    }
  },
  toggleTray: () => {
    return (dispatch, getState) => {
      const { app: { trayMinimize } } = getState()
      dispatch({
        type: constants.TOGGLE_TRAY,
        payload: { trayMinimize: !trayMinimize }
      })
    }
  }
}
// Action handlers
const ACTION_HANDLERS = {
  APP_INITIALIZE: (state, action) => {
    return {
      ...state,
      ...action.payload
    }
  },
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
  },
  GET_AUDIO_DEVICES: (state, action) => {
    const { payload } = action
    return {
      ...state,
      ...payload
    }
  },
  SET_AUDIO_DEVICE: (state, action) => {
    const { payload: { id } } = action
    const newState = {
      ...state,
      selectedOutput: id
    }
    syncStorageWithState(newState)
    return newState
  },
  SET_GLOBAL_VOLUME: (state, action) => {
    const { payload } = action
    const newState = {
      ...state,
      ...payload
    }
    syncStorageWithState(newState)
    return newState
  },
  TOGGLE_ANALYTICS: (state, action) => {
    const { payload } = action
    const newState = {
      ...state,
      ...payload
    }
    syncStorageWithState(newState)
    return newState
  },
  UPDATE_READY: (state) => {
    return {
      ...state,
      hasUpdate: true
    }
  },
  UPDATE_TUT: (state, action) => {
    const { payload } = action
    const newState = {
      ...state,
      ...payload
    }
    syncStorageWithState(newState)
    return newState
  },
  CLEAR_APP: (state) => {
    let data = {
      selectedOutput: null,
      globalVolume: 100,
      shareAnalytics: true,
      tutMode: true,
      tutStep: 1
    }
    syncStorageWithState(data)
    return {
      ...initialState
    }
  },
  TOGGLE_TRAY: (state, action) => {
    const { payload } = action
    const newState = {
      ...state,
      ...payload
    }
    syncStorageWithState(newState)
    return newState
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
  url: null,
  outputs: [],
  selectedOutput: null,
  globalVolume: 100,
  shareAnalytics: true,
  tutMode: true,
  tutStep: 1,
  trayMinimize: false
}
export default function (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
