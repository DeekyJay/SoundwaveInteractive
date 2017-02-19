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

let menu
let template
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
const trayIconPath = process.env.NODE_ENV === 'development'
  ? `${__dirname}/src/static/tray.png`
  : `${__dirname}/dist/static/tray.png`
const appIconPath = process.env.NODE_NEV === 'development'
  ? `${__dirname}/src/static/icon.png`
  : `${__dirname}/dist/static/icon.png`
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
  require(utilsPath + '/jumper')

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
  buildMenu(mainWindow)
})

const WIN32 = process.platform === 'win32'

ipcMain.on('CHECK_FOR_UPDATE', function (event) {
  console.log('CHECKING')
  if (WIN32) {
    updater.check((err, status) => {
      console.log(err, status)
      if (!err && status) {
        // Download the update
        updater.download()
      }
    })
  } else {
    updater._getLatestTag()
    .then(tag => {
      if (updater._newVersion(tag)) mainWindow.webContents.send('UPDATE_READY')
    })
  }
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

let tray = null
ipcMain.on('GET_TRAY_ICON', function (event) {
  tray = new Tray(trayIconPath)
  tray.setToolTip('Soundwave Interactive')
  var contextMenu = Menu.buildFromTemplate([
    { label: 'Open',
      click: function () {
        showApp()
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
  tray.on('click', function (event) {
    showApp()
  })
  mainWindow.webContents.send('GET_TRAY_ICON', tray)
})

function showApp () {
  mainWindow.show()
  if (app.dock) app.dock.show()
  tray.destroy()
}


function buildMenu (mainWindow) {
  if (process.platform === 'darwin') {
    template = [{
      label: 'Soundwave Interactive',
      submenu: [{
        label: 'Quit',
        accelerator: 'Command+Q',
        click () {
          app.quit()
        }
      }]
    }, {
      label: 'Edit',
      submenu: [{
        label: 'Undo',
        accelerator: 'Command+Z',
        selector: 'undo:'
      }, {
        label: 'Redo',
        accelerator: 'Shift+Command+Z',
        selector: 'redo:'
      }, {
        type: 'separator'
      }, {
        label: 'Cut',
        accelerator: 'Command+X',
        selector: 'cut:'
      }, {
        label: 'Copy',
        accelerator: 'Command+C',
        selector: 'copy:'
      }, {
        label: 'Paste',
        accelerator: 'Command+V',
        selector: 'paste:'
      }, {
        label: 'Select All',
        accelerator: 'Command+A',
        selector: 'selectAll:'
      }]
    }, {
      label: 'View',
      submenu: (process.env.NODE_ENV === 'development') ? [{
        label: 'Reload',
        accelerator: 'Command+R',
        click () {
          mainWindow.reload()
        }
      }, {
        label: 'Toggle Developer Tools',
        accelerator: 'Alt+Command+I',
        click () {
          mainWindow.toggleDevTools()
        }
      }] : [{
        label: 'Toggle Developer Tools',
        accelerator: 'Alt+Command+I',
        click () {
          mainWindow.toggleDevTools()
        }
      }]
    }, {
      label: 'Window',
      submenu: [{
        label: 'Minimize',
        accelerator: 'Command+M',
        selector: 'performMiniaturize:'
      }, {
        label: 'Close',
        accelerator: 'Command+W',
        selector: 'performClose:'
      }, {
        type: 'separator'
      }, {
        label: 'Bring To Front',
        selector: 'arrangeInFront:'
      }]
    }]

    menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
  } else {
    template = [{
      label: 'File',
      submenu: [{
        label: 'Close',
        accelerator: 'Ctrl+W',
        click () {
          mainWindow.close()
        }
      }]
    }, {
      label: 'View',
      submenu: (process.env.NODE_ENV === 'development') ? [{
        label: 'Reload',
        accelerator: 'Ctrl+R',
        click () {
          mainWindow.reload()
        }
      }, {
        label: 'Toggle Developer Tools',
        accelerator: 'Alt+Ctrl+I',
        click () {
          mainWindow.toggleDevTools()
        }
      }] : [{
        label: 'Toggle Developer Tools',
        accelerator: 'Alt+Ctrl+I',
        click () {
          mainWindow.toggleDevTools()
        }
      }]
    }, {
      label: 'Help',
      submenu: [{
        label: 'Learn More',
        click () {
          shell.openExternal('https://soundwave.deek.io/wiki')
        }
      }]
    }]
    menu = Menu.buildFromTemplate(template)
    mainWindow.setMenu(menu)
  }
}

// This seems bad...
process.on('uncaughtException', function (error) {
  console.log('UNCAUGHT ERROR', error)
  if (error.stack.indexOf('WebSocket.ping') === -1) {
    electron.dialog.showErrorBox('Uh Oh!', error.stack)
  }
})
