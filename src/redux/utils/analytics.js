import fetch from './fetch'
import config from '../../app.config'

// If this is the first login, create a new account,
// if not, validify that they are credentials for the user and save them.
export function init (userId, tokens) {
  const data = {
    user: {
      userId: userId,
      token: tokens
    }
  }
  console.log('ANALYTICS INIT', data)
  fetch.post(`${config.API_BASE_URL}/auth`, data)
  .then(res => {
    // API is now authenticated with Beam.
    console.log(res)
    if (res.token) {
      localStorage.setItem('si-token', res.token)
    }
  })
  .catch(err => {
    throw err
  })
}

export function wentInteractive () {
  fetch.put(`${config.API_BASE_URL}/users/connected`)
}

export function updateProfiles () {
  console.log('Update Profiles')
}

export function updateSoundCount () {
  console.log('Update Sound Count')
}

export default {
  init,
  wentInteractive,
  updateProfiles,
  updateSoundCount
}
