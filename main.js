'use strict'
process.env.NODE_ENV = process.env.NODE_ENV || 'production'

// import electron from 'electron'
const electron = require('electron')
const app = electron.app
const BrowserWindow = electron.BrowserWindow
const crashReporter = electron.crashReporter
const nativeImage = electron.nativeImage
const autoUpdater = electron.autoUpdater
const ipcMain = electron.ipcMain
const appIcon = nativeImage.createFromPath('./app_build/icon.ico')
let mainWindow = null
const appVersion = require('./package.json').version

let updateFeed = 'http://localhost:5001/updates/latest'

if (process.env.NODE_ENV !== 'development') {
  updateFeed = process.platform === 'darwin'
    ? 'http://localhost:5001/updates/latest'
    : 'http://localhost:5001/updates/latest'
}

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
const utilsPath = process.env.NODE_ENV === 'development' ? './utils' : './dist/utils'
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
    minWidth: 1140,
    minHeight: 760,
    title: 'Soundwave Interactive',
    frame: false,
    icon: appIcon,
    show: false
  })

  // Emitted when the window is loaded and ready to be shown.
  mainWindow.on('ready-to-show', function () {
    mainWindow.show()
  })

  mainWindow.webContents.on('will-navigate', ev => {
    ev.preventDefault()
  })

  process.env.NODE_ENV === 'development' ? mainWindow.loadURL(`file://${__dirname}/src/index.html`)
    : mainWindow.loadURL(`file://${__dirname}/dist/index.html`)

  // Load IPC handler
  require(utilsPath + '/ipcHandler')
  require(utilsPath + '/interactive')

  mainWindow.on('closed', () => {
    mainWindow = null
    app.quit()
  })

  if (process.env.NODE_ENV === 'development') {
    mainWindow.openDevTools()
  }

  mainWindow.on('focus', function () {
    mainWindow.webContents.send('browser-window-focus')
  })
  mainWindow.on('blur', function () {
    mainWindow.webContents.send('browser-window-blur')
  })
})

ipcMain.on('GET_VERSION', function (event) {
  event.sender.send('GET_VERSION', null, { version: appVersion, arch: process.arch, platform: process.platform })
})

ipcMain.on('UPDATE_APP', function (event, param) {
  const url = param.url
  autoUpdater.on('checking-for-update', function (d) {
    console.log('Checking For Update...')
    console.log(d)
  })

  autoUpdater.on('update-available', function (d) {
    console.log('Update Available..')
    console.log(d)
  })

  autoUpdater.on('update-not-available', function (d) {
    console.log('No Update Available..')
    console.log(d)
  })

  autoUpdater.on('error', function (d) {
    console.log('Update Error', d)
  })

  autoUpdater.on('update-downloaded', function (event, releaseNotes, releaseName, releaseDate, updateURL) {
    console.log(releaseName, releaseDate, updateURL)
    autoUpdater.quitAndInstall()
  })
  autoUpdater.setFeedURL(url)
  autoUpdater.checkForUpdates()
})
