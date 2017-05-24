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
  TOGGLE_LOCK: 'TOGGLE_LOCK',
  SET_BOARD_HOVER: 'SET_BOARD_HOVER',
  UPDATE_LOCAL_LAYOUT: 'UPDATE_LOCAL_LAYOUT'
}

const getGridFromButtons = (controls, profile, sounds) => {
  let large_grid = []
  if (controls && controls.scenes && controls.scenes.length) {
    controls.scenes[0].controls.map(button => {
      // Grabbing the first blueprint -- Will it always be the large grid?
      const position = _.find(button.position, b => b.size === 'large')
      const soundId = profile.sounds[button.controlID]
      const sound = _.find(sounds, s => s.id === soundId)
      let name = sound && sound.name ? sound.name : 'Unassigned'
      large_grid.push({
        w: position.width,
        h: position.height,
        maxW: position.width,
        maxH: position.height,
        x: position.x,
        y: position.y,
        name: name,
        i: String(button.controlID),
        static: true
      })
    })
  }
  return large_grid
}

const DEVLAB_APP_NAME = 'Soundwave Interactive Soundboard'

function createGameAndVersion (controls, userId) {
  console.log('Time to create game and version')
  const data = {
    name: DEVLAB_APP_NAME,
    description: 'Soundwave Interactive Personal Soundboard',
    installation: 'Download the app at http://soundwave.deek.io/',
    ownerId: userId
  }
  let gameId, versionId
  return client.game.create({ body: data, json: true })
  .then(res => {
    console.log('Created Game, update it Interactive 2.0')
    return client.request('PUT', `/interactive/games/${res.body.id}`, { body: { controlVersion: '2.0' }, json: true })
  })
  .then(res => {
    gameId = res.body.id
    return client.game.ownedGameVersions(userId, gameId)
  })
  .then(res => {
    versionId = res.body[0].versions[0].id
    return client.request('PUT', `/interactive/versions/${versionId}`,
      { body: { controlVersion: '2.0' }, json: true })
  })
  .then(res => {
    const version = {
      controlVersion: '2.0',
      controls: controls
    }
    return client.request('PUT', `/interactive/versions/${versionId}`, { body: version, json: true })
  })
  .then(res => {
    return { controls: res.body.controls, gameId, versionId }
  })
}

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
      const profile = _.find(profiles, p => p.id === profileId)
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
        if (!versionId) throw Error('No Game Found')
        return client.request('GET', `/interactive/versions/${versionId}`)
      })
      .then(res => {
        let game = res.body
        console.log('Game', game)
        let valid = true
        if (game.controlVersion === '1.0') {
          game = DevLabUtil.convertInteractiveOneToTwo(game)
          valid = false
        }
        if (!valid) {
          console.log('Not Valid, Delete it, Create it', gameId)
          return client.request('DELETE', `/interactive/games/${gameId}`)
          .then(() => {
            console.log('Game deleted!')
            return createGameAndVersion(game.controls, user.id)
          })
          .then(newGame => {
            return { controls: newGame.controls, gameId: newGame.gameId, versionId: newGame.versionId }
          })
          .catch(err => {
            throw err
          })
        } else {
          return { controls: res.body.controls, gameId, versionId }
        }
      })
      .then(data => {
        const large_grid = getGridFromButtons(data.controls, profile, sounds)
        dispatch({
          type: 'GET_OWNED_GAMES_FULFILLED',
          payload: {
            board: data.controls || [],
            hasSoundBoardGame: hasSoundBoardGame,
            gameId: data.gameId || '',
            versionId: data.versionId || '',
            large_grid: large_grid
          }
        })
      })
      .catch(err => {
        dispatch({type: 'GET_OWNED_GAMES_REJECTED'})
        // toastr.error('Load Game Error', 'An error occured while loading the soundboard game.')
        throw err
      })
    }
  },
  createGame: () => {
    const controls = DevLabUtil.makeDefaultControls()
    return (dispatch, getState) => {
      const { auth: { user }, profiles: { profiles, profileId }, sounds: { sounds } } = getState()
      const profile = _.find(profiles, p => p.id === profileId)
      dispatch({
        type: 'CREATE_GAME_PENDING'
      })
      createGameAndVersion(controls, user.id)
      .then(data => {
        const { gameId, versionId } = data
        const large_grid = getGridFromButtons(data.controls, profile, sounds)
        dispatch({
          type: 'CREATE_GAME_FULFILLED',
          payload: {
            gameId: gameId,
            versionId: versionId,
            board: controls,
            large_grid: large_grid
          }
        })
      })
      .catch(err => {
        toastr.error('Create Game Failed', 'An error occured while attempting to create the soundboard game.')
        dispatch({
          type: 'CREATE_GAME_REJECTED'
        })
        throw err
      })
    }
  },
  toggleLock: () => {
    return {
      type: constants.TOGGLE_LOCK
    }
  },
  hoverButton: (index) => {
    return (dispatch, getState) => {
      const { board: { large_grid } } = getState()
      let newGrid = Object.assign([], large_grid)
      for (let i = 0; i < newGrid.length; i++) {
        newGrid[i].hover = i === index
      }
      dispatch({
        type: constants.SET_BOARD_HOVER,
        payload: { large_grid: newGrid }
      })
    }
  },
  updateLocalLayout: (controls) => {
    return (dispatch, getState) => {
      const {
        profiles: { profiles, profileId },
        sounds: { sounds }
      } = getState()
      const profile = _.find(profiles, p => p.id === profileId)
      const large_grid = getGridFromButtons(controls, profile, sounds)
      dispatch({
        type: constants.UPDATE_LOCAL_LAYOUT,
        payload: { large_grid: large_grid }
      })
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
  },
  SET_BOARD_HOVER: (state, actions) => {
    const { payload: { large_grid } } = actions
    return {
      ...state,
      large_grid: large_grid
    }
  },
  UPDATE_LOCAL_LAYOUT: (state, actions) => {
    const { payload: { large_grid } } = actions
    return {
      ...state,
      large_grid: large_grid
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
  isLocked: false,
  board: {
    scenes: []
  }
}
export default function (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
