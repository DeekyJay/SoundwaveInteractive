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

ipc.on('setCooldown', function (event, _cooldownTypes, _staticCooldown, _cooldowns) {
  setCooldown(_cooldownTypes, _staticCooldown, _cooldowns)
})

ipc.on('initHandshake', function (event, details, id) {
  sender = event.sender
  initHandshake(details, id)
})

export function playSound (id) {
  sender.send('playSound', id)
}

export function robotClosedEvent() {
  sender.send('robotClosedEvent')
}

export default {
  playSound,
  robotClosedEvent
}