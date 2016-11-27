'use strict'
process.env.NODE_ENV = process.env.NODE_ENV || 'production'

// import electron from 'electron'
const electron = require('electron')
const GhReleases = require('electron-gh-releases')
const app = electron.app
const BrowserWindow = electron.BrowserWindow
const crashReporter = electron.crashReporter
const nativeImage = electron.nativeImage
const ipcMain = electron.ipcMain
const Tray = electron.Tray
const Menu = electron.Menu

let mainWindow = null
const appVersion = require('./package.json').version

const options = {
  repo: 'DeekyJay/SoundwaveInteractive-releases',
  currentVersion: appVersion
}

const updater = new GhReleases(options)

crashReporter.start({
  productName: 'Soundwave Interactive',
  companyName: 'Derek Jensen',
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
const trayIconPath = process.env.NODE_ENV === 'development' ? `${__dirname}/src/static/tray.png` : `/${__dirname}/dist/static/tray.png`
const appIconPath = process.env.NODE_NEV === 'development' ? `${__dirname}/src/static/icon.png` : `/${__dirname}/dist/static/icon.png`
const appIcon = nativeImage.createFromPath(appIconPath)
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

ipcMain.on('CHECK_FOR_UPDATE', function (event) {
  console.log('CHECKING')
  updater.check((err, status) => {
    console.log(err, status)
    if (!err && status) {
      // Download the update
      updater.download()
    }
  })
})

// When an update has been downloaded
updater.on('update-downloaded', (info) => {
  console.log('UPDATE WAS DOWNLOADED')
  // Restart the app and install the Update
  mainWindow.webContents.send('UPDATE_READY')
})

updater.autoUpdater.on('error', (err) => {
  console.log(err)
})

ipcMain.on('INSTALL_UPDATE', function (event) {
  console.log('TIME TO INSTALL')
  updater.install()
})

ipcMain.on('GET_TRAY_ICON', function (event) {
  let tray = new Tray(trayIconPath)
  tray.setToolTip('Soundwave Interactive')
  var contextMenu = Menu.buildFromTemplate([
    { label: 'Open',
      click:  function () {
        mainWindow.show()
        app.dock.show()
        tray.destroy()
      }
    },
    {
      label: 'Close',
      click: function () {
        mainWindow.close()
      }
    }
  ])
  tray.setContextMenu(contextMenu)
  mainWindow.webContents.send('GET_TRAY_ICON', tray)
  
})