import Beam from 'beam-client-node'
import storage from 'electron-json-storage'
import Interactive from './beam-interactive-node'
// var Packets = require('beam-interactive-node/dist/robot/packets').default
var robot = null
var running = false

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
        tetrisGameId: versionId
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
  auth.setTokens(newTokens)
  storage.set('tokens', auth.getTokens())
}

/**
 * Handles the report sent from Beam to us.
 * @param  {report} report - The report from Beam
 */
function handleReport (report) {
  if (running) {
    var tactileResults = []
    var isUpdate = false
    report.tactile.forEach(function (tac) {
      var isFired = false
      var prog = 0
      if (tac.pressFrequency > 0) {
        isUpdate = true
        isFired = true
        prog = 1
        console.log("Tactile: " + tac.id + ", Press: " +
                tac.pressFrequency + ", Release: " + tac.releaseFrequency + ", Connected: " + report.users.connected)
      }
      var curCooldown
      var global
      if (global) {
        var tactile = new Packets.ProgressUpdate.TactileUpdate({
          id: tac.id,
          cooldown: curCooldown,
          fired: isFired,
          progress: prog
        })
        tactileResults.push(tactile)
      }
    })
    var progress = {
      tactile: tactileResults,
      joystick: [],
      state: 'default'
    }
    if (isUpdate && global) {
      robot.send(new Packets.ProgressUpdate(progress))
    }
  }
}

/**
* Get's the controls of the interactive app running on a channel
* @param {string} channelID - The ID of the channel
*/
function getInteractiveControls (channelID) {
  return client.request('GET', 'tetris/' + channelID)
  .then(res => {
    return res.body.version.controls
  }, function () {
    throw new Error('Incorrect Version ID or Share Code in your config file')
  })
}


/**
 * Initialize and start Hanshake with Interactive app
 * @param {int} id - Channel ID
 * @param {Object} res - Result of the channel join
 */
export function initHandshake (id, res) {
  var details = res.body
  details.remote = details.address
  details.channel = id

  robot = new Tetris.Robot(details)
  robot.handshake((err) => {
    if (err) {
      console.log("There was a problem connecting to Tetris.")
      console.log(err.body)
    }
    else {
      console.log("Connected to Tetris.")
    }
  })
  robot.on('report', handleReport)
  robot.on('error', (err) => {
    console.log(err.body)
  })
}

export function goInteractive (channelId, versionId) {
  requestInteractive(channelId, versionId)
  .then(res => {
    console.log(res.body)
    if (res.body.tetrisGameId === 'You don\'t have access to that.') {
      throw Error('Permission Denied')
    } else {
      return getInteractiveControls(channelId)
    }
  })
  .then(res => {
    return client.game.join(channelId)
  })
  .then(res => {
    initHandshake(channelId, res)
  })
  .catch(err => {
    throw err
  })
}

/**
 * Stops the connection to Beam.
 */
export function stop () {
  if (robot !== null) {
    robot.close()
  }
}

export default {
  client,
  auth,
  checkStatus,
  requestInteractive,
  getUserInfo,
  updateTokens
}
