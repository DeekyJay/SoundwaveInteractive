const Interactive = require('beam-interactive-node')
const Packets = require('beam-interactive-node/dist/robot/packets').default
const jumper = require('./jumper')
export let robot
let running

let state = 'default'
let cooldownType = 'static'
let staticCooldown = 30000
let cooldowns = []

/**
 * Handles the report sent from Beam to us.
 * @param  {report} report - The report from Beam
 */
function handleReport (report) {
  if (running) {
    var tactileResults = []
    var pressedId
    report.tactile.forEach(function (tac) {
      if (tac.pressFrequency > 0) {
        pressedId = tac.id
        console.log('Tactile: ' + tac.id + ', Press: ' +
                tac.pressFrequency + ', Release: ' + tac.releaseFrequency + ', Connected: ' + report.users.connected)
        jumper.playSound(tac.id)
      }
    })
    if (pressedId || pressedId === 0) {
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
        }
        var tactile = new Packets.ProgressUpdate.TactileUpdate({
          id: tac.id,
          cooldown: cooldownType === 'static' || cooldownType === 'dynamic' || tac.id === pressedId ? curCool : 0,
          fired: cooldownType === 'static' || cooldownType === 'dynamic' || tac.id === pressedId,
          progress: tac.progress
        })
        tactileResults.push(tactile)
      })
      var progress = {
        tactile: tactileResults,
        joystick: [],
        state: state
      }
      robot.send(new Packets.ProgressUpdate(progress))
    }
  }
}

/**
 * Initialize and start Hanshake with Interactive app
 * @param {int} id - Channel ID
 * @param {Object} res - Result of the channel join
 */
export function initHandshake (details, id) {
  console.log('Authenticated with Beam. Starting Interactive Handshake.')
  details = details.body
  robot = new Interactive.Robot({
    remote: details.address,
    channel: id,
    key: details.key
  })
  return new Promise((resolve, reject) => {
    return robot.handshake(err => {
      if (err) {
        console.log('HANDSHAKE ERROR', err)
        reject(err)
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
      // Commenting this out because there is nothing I can do about it
      // and it's just spamming Sentry.
      // Reconnect is handled anyway.
      // throw err
    })
    rb.on('close', () => {
      jumper.robotClosedEvent()
    })
  })
  .catch(err => {
    console.log('CAUGHT ERROR', err)
    if (err.res) {
      throw new Error('Error connecting to Interactive:' + err.res.body.mesage)
    }
    throw new Error('Error connecting to Interactive', err)
  })
}

export function setCooldown (_cooldownType, _staticCooldown, _cooldowns) {
  cooldownType = _cooldownType
  staticCooldown = _staticCooldown
  cooldowns = _cooldowns
}


export default {
  initHandshake,
  setCooldown,
  robot
}