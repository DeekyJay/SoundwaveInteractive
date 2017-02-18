const Interactive = require('beam-interactive-node')
const Packets = require('beam-interactive-node/dist/robot/packets').default
const jumper = require('./jumper')
export let robot
let running

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
        jumper.log('Tactile: ' + tac.id + ', Press: ' +
                tac.pressFrequency + ', Release: ' + tac.releaseFrequency + ', Connected: ' + report.users.connected)
        jumper.playSound(tac.id)
      }
    })
    if (pressedId || pressedId === 0) {
      jumper.log(cooldownType + ' ' + cooldowns[pressedId] + ' ' + smart_increments + ' ' + smart_increment_value)
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
export function initHandshake (details, id) {
  jumper.log('Authenticated with Beam. Starting Interactive Handshake.')
  details = details.body
  robot = new Interactive.Robot({
    remote: details.address,
    channel: id,
    key: details.key
  })
  return new Promise((resolve, reject) => {
    return robot.handshake(err => {
      if (err) {
        jumper.log('HANDSHAKE ERROR', err)
        reject(err)
      } else {
        jumper.log('Connected')
        running = true
        resolve(robot)
      }
    })
  })
  .then(rb => {
    rb.on('report', handleReport)
    rb.on('error', err => {
      jumper.log('RB ERROR', err)
      jumper.throwError('ROBOT ERROR', err)
    })
    rb.on('close', () => {
      jumper.robotClosedEvent()
    })
  })
  .catch(err => {
    console.log(err)
    jumper.log('CAUGHT ERROR', err)
    if (err.res) {
      jumper.throwError('Error connecting to Interactive:' + err.res.body.mesage)
    }
    jumper.throwError('Error connecting to Interactive', err)
  })
}

export function setCooldown (_cooldownType, _staticCooldown, _cooldowns) {
  console.log(_cooldownType, _staticCooldown, _cooldowns)
  cooldownType = _cooldownType
  staticCooldown = _staticCooldown
  cooldowns = _cooldowns
}


export default {
  initHandshake,
  setCooldown,
  robot
}
