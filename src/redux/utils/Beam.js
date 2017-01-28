import Beam from 'beam-client-node'
import storage from 'electron-json-storage'
import { remote } from 'electron'
import _ from 'lodash'
import { actions as soundActions } from '../modules/Sounds'
import { actions as interactiveActions } from '../modules/Interactive'
const Interactive = require('beam-interactive-node')
const Packets = require('beam-interactive-node/dist/robot/packets').default
let robot
let running
let store

let state = 'default'
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

export const client = new Beam()
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

export function requestInteractive (channelID, versionId) {
  return client.request('PUT', 'channels/' + channelID,
    {
      body: {
        interactive: true,
        interactiveGameId: versionId
      },
      json: true
    }
  )
}

export function requestStopInteractive (channelID, forcedDisconnect) {
  if (!forcedDisconnect) return new Promise((resolve, reject) => { resolve(true) })
  return client.request('PUT', 'channels/' + channelID,
    {
      body: {
        interactive: false
      },
      json: true
    }
  )
}

export function getUserInfo () {
  return client.request('GET', '/users/current')
  .then(response => {
    return response
  })
}

export function updateTokens (tokens) {
  const newTokens = {
    access: tokens.access_token || tokens.access,
    refresh: tokens.refresh_token || tokens.refresh,
    expires: tokens.expires_in
      ? Date.now() + tokens.expires_in * 1000
      : tokens.expires
  }
  console.log(newTokens)
  auth.setTokens(newTokens)
  storage.set('tokens', auth.tokens)
}

export function getTokens () {
  return auth.getTokens()
}

/**
* Get's the controls of the interactive app running on a channel
* @param {string} channelID - The ID of the channel
*/
function getInteractiveControls (channelID) {
  return client.request('GET', 'interactive/' + channelID)
  .then(res => {
    return res.body.version.controls
  }, function () {
    throw new Error('Incorrect Version ID or Share Code in your config file')
  })
}

/**
 * Handles the report sent from Beam to us.
 * @param  {report} report - The report from Beam
 */
function handleReport (report) {
  if (running) {
    let tactileResults = []
    let pressedId
    report.tactile.forEach(function (tac) {
      if (tac.pressFrequency > 0) {
        pressedId = tac.id
        console.log('Tactile: ' + tac.id + ', Press: ' +
                tac.pressFrequency + ', Release: ' + tac.releaseFrequency + ', Connected: ' + report.users.connected)
        store.dispatch(soundActions.playSound(tac.id))
      }
    })
    if (pressedId || pressedId === 0) {
      console.log(cooldownType, cooldowns[pressedId], smart_increments, smart_increment_value)
      // Update how many plays the current sound has for this session
      smart_increments[pressedId] ? smart_increments[pressedId]++ : smart_increments[pressedId] = 1
      report.tactile.forEach(tac => {
        let curCool = 5000
        switch (cooldownType) {
          case 'static':
            curCool = staticCooldown
            break
          case 'dynamic':
            curCool = cooldowns[pressedId]
            break
          case 'individual':
            curCool = cooldowns[tac.cooldown]
            break
          case 'smart':
            curCool = pressedId === tac.id ? cooldowns[pressedId] + (smart_increments[pressedId] * smart_increment_value) : staticCooldown
            break
        }
        curCool = parseInt(curCool)
        const tactile = getTactileUpdate({ tactile: tac, cooldownType, pressedId, cooldown: curCool })
        if (tactile) tactileResults.push(tactile)
      })
      let progress = {
        tactile: tactileResults,
        joystick: [],
        state: state
      }
      robot.send(new Packets.ProgressUpdate(progress))
    }
  }
}

function getTactileUpdate (options) {
  if (isCoolingDown(options.tactile.id)) return
  if (options.pressedId === options.tactile.id) setSmartCooldown(options.pressedId, options.cooldown)
  let t = {
    id: options.tactile.id,
    progress: options.tactile.progress,
    cooldown: 0,
    fired: false
  }
  switch (cooldownType) {
    case 'static':
    case 'dynamic':
    case 'smart':
      t.fired = true
      t.cooldown = options.cooldown
      break
    case 'individual':
      t.fired = options.tactile.id === options.pressedId
      t.cooldown = options.tactile.id === options.pressedId ? options.cooldown : 0
      break
  }
  return new Packets.ProgressUpdate.TactileUpdate(t)
}

/**
 * Initialize and start Hanshake with Interactive app
 * @param {int} id - Channel ID
 * @param {Object} res - Result of the channel join
 */
function initHandshake (id) {
  return client.game.join(id)
  .then(function (details) {
    console.log('Authenticated with Beam. Starting Interactive Handshake.')
    details = details.body
    console.log('DETAILS', details)
    robot = new Interactive.Robot({
      remote: details.address,
      channel: id,
      key: details.key,
      debug: true
    })
    console.log('Robot created.')
    robot.on('error', err => {
      if (err.stack.indexOf('Error.PingTimeoutError') > -1) store.dispatch(interactiveActions.pingError())
      if (err.code) throw new Error(err.code)
    })
    return new Promise((resolve, reject) => {
      return robot.handshake(err => {
        console.log('Handshake Callback')
        if (err) {
          console.log('HANDSHAKE ERROR', err)
          reject(err)
          throw new Error('HANDSHAKE_ERROR')
        } else {
          console.log('Connected')
          running = true
          resolve(robot)
        }
      })
    })
    .then(rb => {
      rb.on('report', handleReport)
      rb.on('error', err => {
        console.log('RB ERROR', err)
        throw new Error('ROBOT ERROR')
      })
      rb.on('close', () => {
        store.dispatch(interactiveActions.robotClosedEvent())
      })
    })
    .catch(err => {
      console.log('CAUGHT ERROR', err)
      if (err.res) {
        throw new Error('Error connecting to Interactive:' + err.res.body.mesage)
      }
      throw new Error('Error connecting to Interactive', err)
    })
  })
}

export function goInteractive (channelId, versionId) {
  return requestInteractive(channelId, versionId)
  .then(res => {
    console.log(res.body)
    if (res.body.interactiveGameId === 'You don\'t have access to that.') {
      throw Error('Permission Denied')
    } else {
      return getInteractiveControls(channelId)
    }
  })
  .then(res => {
    return initHandshake(channelId)
  })
  .catch(err => {
    console.log(err)
    throw new Error('CONNECTION_ERROR')
  })
}

/**
 * Stops the connection to Beam.
 */
export function stopInteractive (channelId, forcedDisconnect) {
  return requestStopInteractive(channelId, forcedDisconnect)
  .then(() => {
    return new Promise((resolve, reject) => {
      if (robot !== null) {
        robot.on('close', () => {
          console.log('Robot Closed')
          resolve(true)
        })
        robot.on('error', (err) => {
          reject(err)
        })
        robot.close()
      }
    })
  })
}

export function setupStore (_store) {
  store = _store
}

export function setCooldown (_cooldownType, _staticCooldown, _cooldowns, _smart_increment_value) {
  console.log(cooldownType, staticCooldown)
  cooldownType = _cooldownType
  staticCooldown = _staticCooldown
  cooldowns = _cooldowns
  smart_increment_value = _smart_increment_value
  console.log(cooldownType, staticCooldown, cooldowns)
}

export function setProfile (profileId) {
  state = profileId
}

export default {
  client,
  auth,
  checkStatus,
  requestInteractive,
  getUserInfo,
  updateTokens,
  getTokens,
  goInteractive,
  stopInteractive,
  setupStore,
  setCooldown,
  setProfile
}
