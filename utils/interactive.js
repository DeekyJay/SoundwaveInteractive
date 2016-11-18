import Interactive from 'beam-interactive-node'
import { default as Packets } from 'beam-interactive-node/dist/robot/packets'
import { ipcMain as ipc } from 'electron'
import Beam from 'beam-client-node'
const oAuthOpts = {
  clientId: '50b52c44b50315edb7da13945c35ff5a34bdbc6a05030abe'
}

let robot
let running
let beam
let sender

ipc.on('start', (event, { client, versionId, channelId }) => {
  beam = setupBeamClient(client)
  sender = event.sender
  console.log(beam)
  goInteractive(channelId, versionId)
})

ipc.on('stop', (event) => {
  stop()
})


function setupBeamClient (client) {
  beam = new Beam()
  let auth = beam.use('oauth', oAuthOpts)
  auth.setTokens(client.provider.tokens)
  return beam
}

/**
* Get's the controls of the interactive app running on a channel
* @param {string} channelID - The ID of the channel
*/
function getInteractiveControls (channelID) {
  return beam.request('GET', 'interactive/' + channelID)
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
    var tactileResults = []
    var isUpdate = false
    console.log(report)
    report.tactile.forEach(function (tac) {
      var isFired = false
      var prog = 0
      if (tac.pressFrequency > 0) {
        isUpdate = true
        isFired = true
        prog = 1
        console.log('Tactile: ' + tac.id + ', Press: ' +
                tac.pressFrequency + ', Release: ' + tac.releaseFrequency + ', Connected: ' + report.users.connected)
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
 * Initialize and start Hanshake with Interactive app
 * @param {int} id - Channel ID
 * @param {Object} res - Result of the channel join
 */
function initHandshake (id) {
  return beam.game.join(id)
  .then(function (details) {
    console.log('Authenticated with Beam. Starting Interactive Handshake.')
    details = details.body
    console.log('DETAILS', details)
    robot = new Interactive.Robot({
      remote: details.address,
      channel: id,
      key: details.key
    })
    return new Promise((resolve, reject) => {
      return robot.handshake(err => {
        if (err) {
          console.log(err)
          reject(err)
        } else {
          console.log('Connected')
          resolve(robot)
        }
      })
    })
    .then(rb => {
      console.log('LETS GO')
      rb.on('report', handleReport)
      var count = 0
      rb.on('error', err => {
        if (count < 10) {
          count++
          throw err
        }
      })
    })
    .catch(err => {
      if (err.res) {
        throw new Error('Error connecting to Interactive:' + err.res.body.mesage)
      }
      throw new Error('Error connecting to Interactive', err)
    })
    // reconnector(robot, initHandshake.bind(this, id))
  })
}

function requestInteractive (channelID, versionId) {
  return beam.request('PUT', 'channels/' + channelID,
    {
      body: {
        interactive: true,
        interactiveGameId: versionId
      },
      json: true
    }
  )
}

function goInteractive (channelId, versionId) {
  requestInteractive(channelId, versionId)
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
  })
}

/**
 * Stops the connection to Beam.
 */
function stop () {
  if (robot !== null) {
    robot.close()
  }
}
