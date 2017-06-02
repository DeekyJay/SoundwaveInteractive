import fetch from './fetch'
import config from '../../app.config'
let shouldAnalytics = true
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
  return fetch.post(`${config.API_BASE_URL}/auth`, data)
  .then(res => {
    // API is now authenticated with Beam.
    console.log(res)
    if (res.token) {
      localStorage.setItem('si-token', res.token)
    }
  })
  .catch(err => {
    console.log('Error', err)
    throw err
  })
}

export function wentInteractive () {
  if (shouldAnalytics) fetch.put(`${config.API_BASE_URL}/stats/connected`)
}

export function updateProfiles (currentProfiles) {
  if (shouldAnalytics) {
    console.log('Update Profiles')
    const data = {
      stat: {
        current_profiles: currentProfiles
      }
    }
    fetch.post(`${config.API_BASE_URL}/stats/updateprofiles`, data)
  }
}

export function updateSoundCount (currentSounds) {
  if (shouldAnalytics) {
    console.log('Update Sound Count')
    const data = {
      stat: {
        current_sounds: currentSounds
      }
    }
    fetch.post(`${config.API_BASE_URL}/stats/updatesounds`, data)
  }
}

let playTimeout
let plays = 0
let sparks = 0
export function play (sprk) {
  if (shouldAnalytics) {
    console.log('PLAY SOUND')
    plays++
    sparks += parseInt(sprk)
    clearTimeout(playTimeout)
    playTimeout = setTimeout(() => {
      const data = {
        stat: {
          sparks_spent: sparks,
          plays: plays
        }
      }
      fetch.post(`${config.API_BASE_URL}/stats/play`, data)
      plays = 0
      sparks = 0
    }, 3000)
  }
}

export function shareAnalytics (flag) {
  shouldAnalytics = flag
}

export default {
  init,
  wentInteractive,
  updateProfiles,
  updateSoundCount,
  shareAnalytics,
  play
}
