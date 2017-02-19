import { robot, setCooldown, initHandshake } from './Beam'
import { ipcMain as ipc } from 'electron'
let sender = null

ipc.on('STOP_ROBOT', function (event) {
  if (robot !== null) {
    robot.on('close', () => {
      console.log('Robot Closed')
      event.sender.send('STOP_ROBOT')
    })
    robot.on('error', (err) => {
      console.log('Robot Error')
      event.sender.send('STOP_ROBOT', err)
    })
    robot.close()
  }
})

ipc.on('setCooldown', function (event, _cooldownTypes, _staticCooldown, _cooldowns, _smart_increment_value) {
  setCooldown(_cooldownTypes, _staticCooldown, _cooldowns, _smart_increment_value)
})

ipc.on('initHandshake', function (event, details, id) {
  sender = event.sender
  initHandshake(details, id)
})

export function playSound (id) {
  sender.send('playSound', id)
}

export function robotClosedEvent () {
  sender.send('robotClosedEvent')
}

export function throwError (title, error) {
  sender.send('throwError', { title, error })
}

export function log (arg1, arg2, arg3, arg4, arg5, arg6) {
  sender.send('log', {
    arg1,
    arg2,
    arg3,
    arg4,
    arg5,
    arg6
  })
}

export default {
  playSound,
  robotClosedEvent
}
