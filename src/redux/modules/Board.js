import storage from 'electron-json-storage'
import { toastr } from 'react-redux-toastr'
import _ from 'lodash'
import DevLabUtil from '../utils/DevLabUtil'
import { client } from '../utils/Beam'
import { actions as interactiveActions } from './Interactive'

// Constants
export const constants = {
  SHOW_BOARD: 'SHOW_BOARD',
  EDIT_BOARD: 'EDIT_BOARD',
  ADD_BUTTON_TO_BOARD: 'ADD_BUTTON_TO_BOARD',
  UPDATE_GRID: 'UPDATE_GRID',
  GET_OWNED_GAMES: 'GET_OWNED_GAMES',
  TOGGLE_LOCK: 'TOGGLE_LOCK'
}

const getGridFromTactiles = (tactiles) => {
  let large_grid = []
  if (tactiles && tactiles.length) {
    tactiles.map(tactile => {
      // Grabbing the first blueprint -- Will it always be the large grid?
      const blueprint = _.find(tactile.blueprint, b => b.state === 'default' && b.grid === 'large')
      large_grid.push({
        w: blueprint.width,
        h: blueprint.height,
        maxW: blueprint.width,
        maxH: blueprint.height,
        x: blueprint.x,
        y: blueprint.y,
        name: tactile.text,
        i: String(tactile.id),
        static: true
      })
    })
  }
  return large_grid
}

const makeValidSoundboard = (tactiles, profiles, sounds, profileId) => {
  tactiles = _.cloneDeep(tactiles)
  let profilesInBoard = []
  if (profiles && profiles.length) {
    profiles.map(p => {
      profilesInBoard.push(p.id)
    })
  }
  profilesInBoard = _.uniq(profilesInBoard)
  let newTactiles = []
  if (tactiles && tactiles.length) {
    tactiles.map((t, i) => {
      // const largeDefault = _.find(t.blueprint, b => b.state === 'default' && b.grid === 'large')
      // const mediumDefault = _.find(t.blueprint, b => b.state === 'default' && b.grid === 'medium')
      // const smallDefault = _.find(t.blueprint, b => b.state === 'default' && b.grid === 'small')

      // let newBlueprints = []
      // newBlueprints.push(largeDefault)
      // newBlueprints.push(mediumDefault)
      // newBlueprints.push(smallDefault)
      // profiles.map(p => {
      //   if (largeDefault) {
      //     let large = {}
      //     if (large.width !== largeDefault.width) large.width = largeDefault.width
      //     if (large.height !== largeDefault.height) large.height = largeDefault.height
      //     if (large.x !== largeDefault.x) large.x = largeDefault.x
      //     if (large.y !== largeDefault.y) large.y = largeDefault.y
      //     large.state = p.id
      //     large.grid = 'large'
      //     newBlueprints.push(large)
      //   }
      //   if (mediumDefault) {
      //     let med = {}
      //     if (med.width !== mediumDefault.width) med.width = mediumDefault.width
      //     if (med.height !== mediumDefault.height) med.height = mediumDefault.height
      //     if (med.x !== mediumDefault.x) med.x = mediumDefault.x
      //     if (med.y !== mediumDefault.y) med.y = mediumDefault.y
      //     med.state = p.id
      //     med.grid = 'medium'
      //     newBlueprints.push(med)
      //   }
      //   if (smallDefault) {
      //     let small = {}
      //     if (small.width !== smallDefault.width) small.width = smallDefault.width
      //     if (small.height !== smallDefault.height) small.height = smallDefault.height
      //     if (small.x !== smallDefault.x) small.x = smallDefault.x
      //     if (small.y !== smallDefault.y) small.y = smallDefault.y
      //     small.state = p.id
      //     small.grid = 'small'
      //     newBlueprints.push(small)
      //   }
      // })
      let text = 'Unassigned'
      let cooldown = 0
      let sparks = 0
      let help = ''
      const profile = _.find(profiles, p => p.id === profileId)
      if (profile) {
        const sound = _.find(sounds, s => s.id === profile.sounds[i])
        if (sound) {
          text = sound.name
          help = sound.name ? sound.name.toUpperCase() : ''
          cooldown = parseInt(sound.cooldown) * 1000
          sparks = parseInt(sound.sparks)
        }
      }
      t.text = text
      t.help = help
      t.analysis = {
        holding: true,
        frequency: true
      }
      t.cooldown = {
        press: cooldown
      }
      t.cost = {
        press: {
          cost: sparks
        }
      }
      newTactiles.push(t)
    })
    return newTactiles
  } else {
    throw new Error('Missing Tactiles')
  }
}

const DEVLAB_APP_NAME = 'Soundwave Interactive Soundboard'

// Action Creators
export const actions = {
  showBoard: (size) => {
    return {
      type: constants.SHOW_BOARD,
      payload: { board: size }
    }
  },
  addButtonToBoard: () => {
    return (dispatch, getState) => {
      const { board, board: { selected_board } } = getState()
      let grid = Object.assign([], board[selected_board + '_grid'])
      grid.push(DevLabUtil.getGridButton(grid.length))
      dispatch({
        type: constants.ADD_BUTTON_TO_BOARD,
        payload: { grid: grid, key: selected_board + '_grid' }
      })
    }
  },
  updateGrid: (grid) => {
    return (dispatch, getState) => {
      const { board: { selected_board } } = getState()
      dispatch({
        type: constants.UPDATE_GRID,
        payload: { key: selected_board + '_grid', grid: grid }
      })
    }
  },
  getOwnedGames: () => {
    return (dispatch, getState) => {
      const { auth: { user }, profiles: { profiles, profileId }, sounds: { sounds } } = getState()
      let hasSoundBoardGame, gameId, versionId
      dispatch({type: 'GET_OWNED_GAMES_PENDING'})
      client.game.ownedGames(user.id)
      .then(res => {
        if (res.body && res.body.length) {
          res.body.map(g => {
            if (g.name === DEVLAB_APP_NAME) {
              hasSoundBoardGame = true
              gameId = g.id
              versionId = g.versions[0].id
            }
          })
        }
        return client.request('GET', `/interactive/versions/${versionId}`)
      })
      .then(res => {
        let game = res.body
        let valid = true
        let newtactiles = []
        if (game.controls && game.controls.tactiles) {
          newtactiles = makeValidSoundboard(game.controls.tactiles, profiles, sounds, profileId)
          if (!newtactiles.length || !_.isEqual(newtactiles, game.controls.tactiles)) {
            valid = false
          }
        }
        if (!valid) {
          game.controls.tactiles = newtactiles
          const version = {
            controls: game.controls,
            gameId: gameId
          }
          return client.game.updateVersion(versionId, { body: version, json: true })
        } else {
          return res
        }
      })
      .then(res => {
        const large_grid = getGridFromTactiles(res.body.controls.tactiles)
        dispatch({
          type: 'GET_OWNED_GAMES_FULFILLED',
          payload: {
            board: res.body.controls || [],
            hasSoundBoardGame: hasSoundBoardGame,
            gameId: gameId || '',
            versionId: versionId || '',
            large_grid: large_grid
          }
        })
      })
      .catch(err => {
        dispatch({type: 'GET_OWNED_GAMES_REJECTED'})
        throw err
      })
    }
  },
  createGame: () => {
    const game = DevLabUtil.createGame()
    return (dispatch, getState) => {
      const { auth: { user } } = getState()
      dispatch({
        type: 'CREATE_GAME_PENDING'
      })
      const data = {
        name: DEVLAB_APP_NAME,
        description: 'Soundwave Interactive Personal Soundboard',
        installation: 'Download the app at http://soundwave.pewf.co/',
        ownerId: user.id
      }
      let gameId, versionId
      client.game.create({ body: data, json: true })
      .then(res => {
        gameId = res.body.id
        return client.game.ownedGameVersions(user.id, gameId)
      })
      .then(res => {
        versionId = res.body[0].versions[0].id
        const version = {
          controls: game,
          gameId: gameId
        }
        return client.game.updateVersion(versionId, { body: version, json: true })
      })
      .then(res => {
        const large_grid = getGridFromTactiles(res.body.controls.tactiles)
        dispatch({
          type: 'CREATE_GAME_FULFILLED',
          payload: {
            gameId: gameId,
            versionId: versionId,
            board: game,
            large_grid: large_grid
           }
        })
      })
      .catch(err => {
        console.log(err)
        dispatch({
          type: 'CREATE_GAME_REJECTED'
        })
      })
    }
  },
  updateGame: () => {
    return (dispatch, getState) => {
      const {
        board: { versionId, gameId, board },
        profiles: { profiles, profileId },
        sounds: { sounds },
        interactive: { isConnected }
      } = getState()
      dispatch({ type: 'UPDATE_GAME_PENDING' })
      let game = {
        controls: Object.assign({}, board),
        gameId: gameId
      }
      let newtactiles = makeValidSoundboard(game.controls.tactiles, profiles, sounds, profileId)
      game.controls.tactiles = newtactiles
      return client.game.updateVersion(versionId, {
        body: game,
        json: true
      })
      .then(r => {
        const large_grid = getGridFromTactiles(game.controls.tactiles)
        dispatch({ type: 'UPDATE_GAME_FULFILLED',
          payload: { board: game.controls, large_grid: large_grid } })
        if (isConnected) {
          dispatch(interactiveActions.goInteractive())
          setTimeout(() => { dispatch(interactiveActions.goInteractive()) }, 500)
        }
      })
      .catch(err => {
        dispatch({ type: 'UPDATE_GAME_REJECTED' })
        console.log(err)
        throw err
      })
    }
  },
  toggleLock: () => {
    return {
      type: constants.TOGGLE_LOCK
    }
  }
}
// Action handlers
const ACTION_HANDLERS = {
  SHOW_BOARD: (state, actions) => {
    const { payload: { board } } = actions
    return {
      ...state,
      selected_board: board
    }
  },
  ADD_BUTTON_TO_BOARD: (state, actions) => {
    const { payload: { grid, key } } = actions
    return {
      ...state,
      [key]: grid
    }
  },
  UPDATE_GRID: (state, actions) => {
    const { payload: { grid, key } } = actions
    return {
      ...state,
      [key]: grid
    }
  },
  GET_OWNED_GAMES: (state, actions) => {
    const { payload: { ownedGames } } = actions
    return {
      ...state,
      ownedGames: ownedGames
    }
  },
  GET_OWNED_GAMES_FULFILLED: (state, actions) => {
    const { payload: { board, hasSoundBoardGame, gameId, versionId, large_grid } } = actions
    return {
      ...state,
      hasSoundBoardGame: hasSoundBoardGame,
      gameId: gameId,
      versionId: versionId,
      board: board,
      large_grid: large_grid
    }
  },
  GET_OWNED_GAMES_REJECTED: (state) => {
    return {
      ...state,
      isGameCreating: false
    }
  },
  CREATE_GAME_FULFILLED: (state, actions) => {
    const { payload: { gameId, versionId, board, large_grid } } = actions
    return {
      ...state,
      board: board,
      gameId: gameId,
      versionId: versionId,
      large_grid: large_grid,
      hasSoundBoardGame: true,
      gameCreationError: false,
      isGameCreating: false
    }
  },
  CREATE_GAME_REJECTED: (state) => {
    return {
      ...state,
      isGameCreating: false,
      gameCreationError: true
    }
  },
  CREATE_GAME_PENDING: (state) => {
    return {
      ...state,
      isGameCreating: true
    }
  },
  UPDATE_GAME_FULFILLED: (state, actions) => {
    const { payload: { board, large_grid } } = actions
    return {
      ...state,
      board: board,
      large_grid: large_grid,
      isUpdating: false
    }
  },
  UPDATE_GAME_PENDING: (state) => {
    return {
      ...state,
      isUpdating: true
    }
  },
  UPDATE_GAME_REJECTED: (state) => {
    return {
      ...state,
      updateError: true,
      isUpdating: false
    }
  },
  TOGGLE_LOCK: (state) => {
    return {
      ...state,
      isLocked: !state.isLocked
    }
  }
}
// Reducer
export const initialState = {
  selected_board: '',
  edit_mode: false,
  large_grid: [],
  medium_grid: [],
  small_grid: [],
  expanded: false,
  ownedGames: [],
  hasSoundBoardGame: false,
  gameId: '',
  versionId: '',
  isGameCreating: true,
  gameCreationError: false,
  isUpdating: false,
  updateError: false,
  isLocked: false
}
export default function (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
