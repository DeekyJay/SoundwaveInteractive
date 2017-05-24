import _ from 'lodash'
import cuid from 'cuid'

const createProfile = function (id, name) {
  const profile = {
    id: id,
    name: name,
    sounds: []
  }
  return profile
}

export function makeDefaultControls () {
  let controls = []
  for (let i = 0; i < 16; i++) {
    const control = {
      controlID: `${cuid()}`,
      kind: 'button',
      position: getPositionForButton(i),
      text: 'Unassigned',
      cost: 0,
      disabled: true
    }
    controls.push(control)
  }
  return {
    scenes: [
      {
        sceneID: 'default',
        controls: controls
      }
    ]
  }
}

export function controlsFromProfileAndLayout (profile, sounds, layout) {
  let controls = []
  for (let i = 0; i < profile.sounds.length; i++) {
    const soundId = profile.sounds[i]
    const sound = _.find(sounds, s => s.id === soundId)
    const button = layout[i]
    let control = {
      ...button,
      text: 'Unassigned',
      cost: 0,
      disabled: true
    }
    if (sound) {
      control.text = sound.name
      control.cost = parseInt(sound.sparks)
      control.disabled = false
      controls.push(control)
    }
  }
  return controls
}

export function convertInteractiveOneToTwo (game) {
  console.log('Convert Interactive 1.0 to 2.0')
  game.controlVersion = '2.0'
  let controls = []
  game.controls.tactiles.forEach(tactile => {
    let control = {
      controlID: `${tactile.id}`,
      kind: 'button',
      text: 'Unassigned',
      position: [],
      cost: 0,
      disabled: true
    }
    tactile.blueprint.forEach(blueprint => {
      const position = {
        width: blueprint.width * 5,
        height: (blueprint.height * 5) - 2,
        size: blueprint.grid,
        x: blueprint.x * 5,
        y: (blueprint.y * 5) + 1
      }
      control.position.push(position)
    })
    controls.push(control)
  })
  game.controls = {
    scenes: [
      {
        sceneID: 'default',
        controls: controls
      }
    ]
  }
  return game
}

function getPositionForButton (number) {
  let largeTactile = getPositionForSize(number, 'large', 8, 10, 9)
  let mediumTactile = getPositionForSize(number, 'medium', 4, 10, 3)
  let smallTactile = getPositionForSize(number, 'small', 3, 10, 3)
  return [largeTactile, mediumTactile, smallTactile]
}

function getPositionForSize (number, size, cols, width, height) {
  return {
    width: width,
    height: height,
    size: size,
    x: (number % cols) * width,
    y: (Math.floor(number / cols) * height) + (Math.floor(number / cols)) + 1
  }
}

function makeGrid (cols, rows) {
  let arr = []
  let count = 0
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      arr.push({
        i: String(count),
        x: i,
        y: j,
        w: 1,
        h: 1,
        static: true
      })
      count += 1
    }
  }
  return arr
}

function getGridButton (i) {
  return {
    i: String(i),
    x: 0,
    y: 0,
    w: 1,
    h: 1,
    maxW: 10,
    maxH: 5
  }
}

export default {
  createProfile,
  makeDefaultControls,
  controlsFromProfileAndLayout,
  convertInteractiveOneToTwo,
  makeGrid,
  getGridButton
}
