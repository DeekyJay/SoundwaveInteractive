import { ipcMain, session, nativeImage, BrowserWindow } from 'electron'
const mainWindow = BrowserWindow.getAllWindows()[0]
import electronAuth from 'electron-oauth2'
import storage from 'electron-json-storage'
const appIcon = nativeImage.createFromPath('./app_build/icon.ico')
var config = {
  clientId: 'ff6aea1186cb70e1d8446662ba9e00535ac7ed7326464971',
  authorizationUrl: 'https://mixer.com/oauth/authorize',
  tokenUrl: 'https://mixer.com/api/v1/oauth/token',
  useBasicAuthorizationHeader: false,
  redirectUri: 'https://deek.io'
}
const scopes = [
  'user:details:self',
  'channel:update:self',
  'interactive:robot:self',
  'interactive:manage:self'
]

const windowParams = {
  autoHideMenuBar: true,
  height: 800,
  icon: appIcon,
  parent: mainWindow,
  webPreferences: {
    sandbox: true
  }
}

const options = {
  scope: scopes.join(' ')
}

ipcMain.on('auth', (event) => {
  const myApiOauth = electronAuth(config, windowParams)
  console.log('Time to Auth')
  console.log(myApiOauth)
  console.log(config)
  myApiOauth.getAccessToken(options)
  .then(token => {
    event.sender.send('auth', token)
    // myApiOauth.refreshToken(token.refresh_token)
    // .then(newToken => {
    //   console.log(token, newToken)
    //   event.sender.send('auth', newToken)
    // })
    // .catch(err => {
    //   console.log(err)
    //   event.sender.send('auth', false)
    // })
  })
  .catch(err => {
    console.log(err)
    event.sender.send('auth', false)
  })
})

ipcMain.on('logout', (event, { clear }) => {
  console.log('LOGOUT')
  session.defaultSession.clearStorageData({}, () => {
    console.log('Storage Data Cleared')
    storage.remove('tokens', (err) => {
      console.log(err)
    })
  })
  session.defaultSession.clearAuthCache({}, () => {
    console.log('Auth Cache Cleared')
  })
  if (clear) {
    session.defaultSession.clearCache(() => {
      console.log('Cache Cleared')
    })
  }
})
