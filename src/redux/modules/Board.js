import storage from 'electron-json-storage'
import { toastr } from 'redux-toastr'
import _ from 'lodash'
import DevLabUtil from '../utils/DevLabUtil'
import { client, auth, checkStatus, requestInteractive } from '../utils/Beam'
console.log(client, auth)

// Constants
export const constants = {
  SHOW_BOARD: 'SHOW_BOARD',
  EDIT_BOARD: 'EDIT_BOARD',
  ADD_BUTTON_TO_BOARD: 'ADD_BUTTON_TO_BOARD',
  UPDATE_GRID: 'UPDATE_GRID',
  GET_OWNED_GAMES: 'GET_OWNED_GAMES'
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
      const { auth: { user } } = getState()
      let hasSoundBoardGame, gameId, versionId
      dispatch({type: 'GET_OWNED_GAMES_PENDING'})
      client.game.ownedGames(user.id)
      .then(res => {
        console.log(res)
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
        console.log(res)
        dispatch({
          type: 'GET_OWNED_GAMES_FULFILLED',
          payload: {
            board: res.body.controls || [],
            hasSoundBoardGame: hasSoundBoardGame,
            gameId: gameId || '',
            versionId: versionId || ''
          }
        })
      })
      .catch(err => {
        console.log(err)
        dispatch({type: 'GET_OWNED_GAMES_REJECTED'})
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
        dispatch({
          type: 'CREATE_GAME_FULFILLED',
          payload: { gameId: gameId, versionId: versionId, board: game }
        })
      })
      .catch(err => {
        console.log(err)
        dispatch({
          type: 'CREATE_GAME_REJECTED'
        })
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
    console.log('FULFILLED')
    const { payload: { board, hasSoundBoardGame, gameId, versionId } } = actions
    return {
      ...state,
      hasSoundBoardGame: hasSoundBoardGame,
      gameId: gameId,
      versionId: versionId,
      board: board
    }
  },
  CREATE_GAME_FULFILLED: (state, actions) => {
    const { payload: { gameId, versionId, board } } = actions
    return {
      ...state,
      board: board,
      gameId: gameId,
      versionId: versionId,
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
  buttons_left: 100,
  ownedGames: [],
  hasSoundBoardGame: false,
  gameId: '',
  versionId: '',
  isGameCreating: false,
  gameCreationError: false
}
export default function (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
