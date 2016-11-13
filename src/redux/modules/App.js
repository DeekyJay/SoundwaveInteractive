import { remote, ipcRenderer } from 'electron'
import fetch from '../utils/fetch'
import _ from 'lodash'
import storage from 'electron-json-storage'
import { Howler } from 'howler'

const { BrowserWindow } = remote
const mainWindow = BrowserWindow.getAllWindows()[0]
// Constants
export const constants = {
  MINIMIZE: 'MINIMIZE',
  MAXIMIZE: 'MAXIMIZE',
  CLOSE: 'CLOSE',
  FULLSCREEN: 'FULLSCREEN',
  ALWAYS_ON_TOP: 'ALWAYS_ON_TOP',
  CHECK_FOR_UPDATE: 'CHECK_FOR_UPDATE',
  GET_AUDIO_DEVICES: 'GET_AUDIO_DEVICES',
  SET_AUDIO_DEVICE: 'SET_AUDIO_DEVICE',
  SET_GLOBAL_VOLUME: 'SET_GLOBAL_VOLUME',
  APP_INITIALIZE: 'APP_INITIALIZE',
  TOGGLE_ANALYTICS: 'TOGGLE_ANALYTICS'
}

ipcRenderer.on('browser-window-focus', function () {
  document.body.classList.remove('blurred')
})

ipcRenderer.on('browser-window-blur', function () {
  document.body.classList.add('blurred')
})

const syncStorageWithState = (state) => {
  const data = {
    globalVolume: state.globalVolume,
    selectedOutput: state.selectedOutput,
    shareAnalytics: state.shareAnalytics
  }
  storage.set('app', data, (err) => {
    if (err) throw err
  })
}

// Action Creators
export const actions = {
  initialize: (data) => {
    return {
      type: constants.APP_INITIALIZE,
      payload: data
    }
  },
  minimize: () => {
    mainWindow.minimize()
    return {
      type: constants.MINIMIZE
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
    return (dispatch) => {
      ipcRenderer.send('GET_VERSION')
      ipcRenderer.once('GET_VERSION', (event, err, result) => {
        const {version, platform, arch} = result
        fetch.get(`http://localhost:3000/updates/latest?v=${version}&platform=${platform}&arch=${arch}`)
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
      const { app: { shareAnalytics } } = getState()
      dispatch({
        type: constants.TOGGLE_ANALYTICS,
        payload: { shareAnalytics: !shareAnalytics }
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
  shareAnalytics: true
}
export default function (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
