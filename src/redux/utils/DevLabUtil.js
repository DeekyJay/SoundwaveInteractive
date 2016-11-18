const createProfile = function (id, name) {
  // const board = {
  //   reportInterval: 50,
  //   tactiles: renderTactiles(),
  //   joysticks: [],
  //   screens: []
  // }
  const profile = {
    id: id,
    name: name,
    sounds: []
  }
  return profile
}

const createGame = function () {
  const board = {
    reportInterval: 50,
    tactiles: renderTactiles(),
    joysticks: [],
    screens: []
  }
  return board
}

function renderTactiles () {
  let tactiles = []
  for (let i = 0; i < 16; i++) {
    const tactile = {
      id: i,
      type: 'tactiles',
      blueprint: getBlueprintsForTactile(i),
      analysis: {
        holding: true,
        frequency: true
      },
      text: 'Sound ' + (i + 1),
      cost: {
        press: {
          cost: 0
        }
      },
      cooldown: {
        press: 15000
      }
    }
    tactiles.push(tactile)
  }
  return tactiles
}

function getBlueprintsForTactile (number) {
  let largeTactile = getBlueprintForGrid(number, 'large', 8, 2, 2)
  let mediumTactile = getBlueprintForGrid(number, 'medium', 4, 2, 1)
  let smallTactile = getBlueprintForGrid(number, 'small', 3, 2, 1)
  return [largeTactile, mediumTactile, smallTactile]
}

function getBlueprintForGrid (number, grid, cols, width, height) {
  return {
    width: width,
    height: height,
    grid: grid,
    state: 'default',
    x: (number % cols) * width,
    y: Math.floor(number / cols) * height
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
    maxW: 4,
    maxH: 2
  }
}

export default {
  createProfile,
  createGame,
  makeGrid,
  getGridButton
}
