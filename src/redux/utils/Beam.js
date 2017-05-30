import Beam from 'beam-client-node'
import MixerSocket from 'beam-client-node/lib/ws'
import storage from 'electron-json-storage'
import { actions as soundActions } from '../modules/Sounds'
import { actions as interactiveActions } from '../modules/Interactive'
import { GameClient, setWebSocket, delay } from 'beam-interactive-node2'
import ws from 'ws'
import { controlsFromProfileAndLayout } from './DevLabUtil'
setWebSocket(ws)
let store

export const client = new Beam()
export const gclient = new GameClient()

let playing = false
function playTimeout () {
  playing = true
  setTimeout(() => { playing = false }, 500)
}
// Cooldown Related Variables
let cooldownType = 'static'
let staticCooldown = 30000
let cooldowns = []
let smart_increments = []
let smart_increment_value = 5000

let current_cooldowns = []
function setSmartCooldown (i, t) {
  current_cooldowns[i] = 1
  setTimeout(() => {
    current_cooldowns[i] = 0
  }, t)
}

function isCoolingDown (i) {
  return current_cooldowns[i]
}

// Setup the events for GameClinet
gclient.on('open', () => {
  console.log('Interactive 2.0 is connected!')
})

gclient.on('error', (err) => {
  console.log('Error', err)
  store.dispatch(interactiveActions.robotClosedEvent())
})
gclient.on('close', () => {
  console.log('Closed')
  store.dispatch(interactiveActions.robotClosedEvent())
})

gclient.state.on('participantJoin', participant => {
  console.log(participant)
  console.log(`${participant.username} (${participant.sessionID}) Joined!`)
})

gclient.state.on('participantLeave', participant => {
  console.log(participant + 'Left')
})

const oAuthOpts = {
  clientId: '50b52c44b50315edb7da13945c35ff5a34bdbc6a05030abe'
}
export const auth = client.use('oauth', oAuthOpts)

export function checkStatus () {
  console.log(auth.isAuthenticated()
  ? '########### User is Authenticated ###########'
  : '########### User Auth FAILED ###########')
  return auth.isAuthenticated()
}

export function getUserInfo () {
  return client.request('GET', '/users/current')
  .then(response => {
    return response
  })
}

export function updateTokens (tokens) {
  console.log(tokens)
  const newTokens = {
    access: tokens.access_token || tokens.access,
    refresh: tokens.refresh_token || tokens.refresh,
    expires: tokens.expires_in
      ? Date.now() + tokens.expires_in
      : tokens.expires.toString()
  }
  auth.setTokens(newTokens)
  storage.set('tokens', auth.tokens)
}

export function getTokens () {
  return auth.getTokens()
}

/**
 * Initialize and start Hanshake with Interactive app
 * @param {int} id - Channel ID
 * @param {Object} res - Result of the channel join
 */
function initHandshake (versionId, token, profile, sounds, layout) {
  let userId, channelId, username
  console.log('init handshake')
  return gclient.open({
    authToken: token,
    versionId: versionId
  })
  .then(() => {
    return updateControls(profile, sounds, layout)
  })
  .then(() => {
    return getUserInfo()
  })
  .then(res => {
    userId = res.body.id
    channelId = res.body.channel.id
    username = res.body.username
    return client.chat.join(channelId)
  })
  .then(res => {
    console.log(res.body)
    return createChatSocket(userId, channelId, username, res.body.endpoints, res.body.authkey)
  })
  .catch(err => {
    console.log('Join Error', err)
  })
}


export function goInteractive (versionId, token, profile, sounds, layout) {
  console.log('go interactive')
  return initHandshake(versionId, token, profile, sounds, layout)
}

/**
 * Stops the connection to Mixer.
 */
export function stopInteractive (channelId, forcedDisconnect) {
  gclient.close()
}

export function setupStore (_store) {
  store = _store
}

export function setCooldown (_cooldownType, _staticCooldown, _cooldowns, _smart_increment_value) {
  cooldownType = _cooldownType
  staticCooldown = _staticCooldown
  cooldowns = _cooldowns
}

export function updateControls (profile, sounds, layout) {
  const controls = controlsFromProfileAndLayout(profile, sounds, layout)
  let scene
  return gclient.synchronizeScenes()
  .then(() => {
    scene = gclient.state.getScene('default')
    return scene.deleteAllControls()
  })
  .then(() => delay(500))
  .then(() => {
    return scene.createControls(controls)
  })
  .then(controls => {
    controls.forEach(control => {
      control.on('mousedown', (inputEvent, participant) => {
        if (!playing) {
          playTimeout()
          console.log(participant.username, inputEvent.input.controlID)
          const pressedId = inputEvent.input.controlID
          store.dispatch(soundActions.playSound(pressedId, participant.username))
          .then(() => {
            if (cooldownType === 'individual') {
              control.setCooldown(cooldowns[parseInt(pressedId)])
            } else if (cooldownType === 'static') {
              controls.forEach(c => c.setCooldown(staticCooldown))
            } else if (cooldownType === 'dynamic') {
              controls.forEach(c => c.setCooldown(cooldowns[parseInt(pressedId)]))
            }
            if (inputEvent.transactionID) {
              gclient.captureTransaction(inputEvent.transactionID)
              .then(() => {
                console.log(`Charged ${participant.username} ${control.sparks} sparks for playing that sound!`)
              })
            }
          })
          .catch(err => {
            // No Transactions
            console.log('YOU JUST SAVED SPARKS BRUH')
            throw err
          })
        } else {
          console.log('Looks like you need a time out!')
        }
      })
    })
    gclient.ready(true)
  })
}

// Chat Related Functionality
let chat
function createChatSocket (userId, channelId, username, endpoints, authkey) {
  const socket = new MixerSocket(endpoints).boot()

  // You don't need to wait for the socket to connect before calling methods,
  // we spool them and run them when connected automatically!
  socket.auth(channelId, userId, authkey)
  .then(() => {
    console.log('You are now authenticated!')
    // Send a chat message
    return socket.call('whisper', [username, 'Soundwave Interactive has connected to chat!'])
  })
  .catch(error => {
    console.log('Oh no! An error occurred!', error)
  })

  // Listen to chat messages, note that you will also receive your own!
  socket.on('ChatMessage', data => {
    console.log('We got a ChatMessage packet!')
    console.log(data)
    console.log(data.message)
  })

  // Listen to socket errors, you'll need to handle these!
  socket.on('error', error => {
    console.error('Socket error', error)
  })

  chat = socket
}

export function sendWhisperCommand (command) {
  if (!chat) return
  console.log('Whispering StreamJar the command: !' + command)
  chat.call('whisper', ['StreamJar', '!' + command])
}

export default {
  client,
  auth,
  checkStatus,
  getUserInfo,
  updateTokens,
  getTokens,
  goInteractive,
  stopInteractive,
  setupStore,
  setCooldown,
  updateControls,
  sendWhisperCommand
}
