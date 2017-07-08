import winston from 'winston'
require('winston-loggly-bulk')
let added = false
export function init (username) {
  if (added) winston.remove(winston.transports.Loggly)
  added = true
  console.log('Initialize Loggy!')
  winston.add(winston.transports.Loggly, {
    token: '6bb3d553-40ca-457d-aa4d-b13e523affd0',
    subdomain: 'deekyjay',
    tags: ['Soundwave', username],
    json: true
  })
  winston.log('info', 'Initialized!')
}

export default { init, ...winston }
