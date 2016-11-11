import { remote, ipcRenderer } from 'electron'
import fetch from '../utils/fetch'
import _ from 'lodash'

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
  SET_AUDIO_DEVICE: 'SET_AUDIO_DEVICE'
}

ipcRenderer.on('browser-window-focus', function () {
  document.body.classList.remove('blurred')
})

ipcRenderer.on('browser-window-blur', function () {
  document.body.classList.add('blurred')
})

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
    console.log('GET AUDIO DEVICES')
    return (dispatch, getState) => {
      navigator.mediaDevices.enumerateDevices()
      .then(devices => {
        console.log(devices)
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
  },
  GET_AUDIO_DEVICES: (state, action) => {
    console.log('HANDLE GET AUDIO', action)
    const { payload } = action
    return {
      ...state,
      ...payload
    }
  },
  SET_AUDIO_DEVICE: (state, action) => {
    const { payload: { id } } = action
    return {
      ...state,
      selectedOutput: id
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
  url: null,
  outputs: [],
  selectedOutput: null
}
export default function (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
