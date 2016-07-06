'use strict'
process.env.NODE_ENV = process.env.NODE_ENV || 'production'

// import electron from 'electron'
const electron = require('electron')
const app = electron.app
const BrowserWindow = electron.BrowserWindow
const crashReporter = electron.crashReporter
const nativeImage = electron.nativeImage
const appIcon = nativeImage.createFromPath('./app_build/icon.ico')
let mainWindow = null

crashReporter.start({
  productName: 'SoundwaveInteractive',
  companyName: 'SoundwaveInteractive',
  submitURL: '',
  autoSubmit: true
})

if (process.env.NODE_ENV === 'development') {
  require('electron-debug')()
  require('babel-register')
}

require('babel-polyfill')

const requirePath = process.env.NODE_ENV === 'development' ? './electron' : './dist/electron'
/**
 * Load squirrel handlers
 */

const windowsEvents = require(requirePath + '/squirrel/WindowsEvents')
if (windowsEvents.handleStartup(app)) {
  return
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    width: 1140,
    height: 760,
    minWidth: 1024,
    minHeight: 720,
    title: 'Soundwave Interactive',
    frame: false,
    icon: appIcon
  })

  process.env.NODE_ENV === 'development' ? mainWindow.loadURL(`file://${__dirname}/src/index.html`)
    : mainWindow.loadURL(`file://${__dirname}/dist/index.html`)

  // Load IPC handler
  require('./utils/ipcHandler')

  mainWindow.on('closed', () => {
    mainWindow = null
    app.quit()
  })

  if (process.env.NODE_ENV === 'development') {
    mainWindow.openDevTools()
  }
})
