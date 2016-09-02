import storage from 'electron-json-storage'
import { toastr } from 'redux-toastr'
import _ from 'lodash'
import DevLabUtil from '../utils/DevLabUtil'

// Constants
export const constants = {
  SHOW_BOARD: 'SHOW_BOARD',
  EDIT_BOARD: 'EDIT_BOARD',
  ADD_BUTTON_TO_BOARD: 'ADD_BUTTON_TO_BOARD',
  UPDATE_GRID: 'UPDATE_GRID',
  GET_OWNED_GAMES: 'GET_OWNED_GAMES'
}

const DEVLAB_APP_NAME = 'Soundwave Interactive Soundboard'
const CLIENT_ID = '5f1e2c8924559bd5b7c29d2cb69cae163d4658b1642142cc'

function checkStatus (beamAuth) {
  console.log(beamAuth.isAuthenticated()
  ? '########### User is Authenticated ###########'
  : '########### User Auth FAILED ###########')
  return beamAuth.isAuthenticated()
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
      const { auth: { beam, user } } = getState()
      console.log(beam)
      beam.game.ownedGames(user.id)
      .then(res => {
        console.log(res)
        dispatch({
          type: constants.GET_OWNED_GAMES,
          payload: { ownedGames: res.body }
        })
      })
      // return {
      //   type: constants.GET_OWNED_GAMES,
      //   payload: beam.game.ownedGames(user.id)
      //   .then((res) => {
      //     console.log(res)
      //     return (dispatch, action) => {
      //       dispatch({...action, payload: { ownedGames: res.body }})
      //     }
      //   })
      // }
    }
  },
  createGame: () => {
    const game = DevLabUtil.createGame()
    return (dispatch, getState) => {
      const { auth: { beam_auth, beam, user } } = getState()
      const data = {
        name: DEVLAB_APP_NAME,
        description: 'Soundwave Interactive Personal Soundboard',
        installation: 'Download the app at http://soundwave.pewf.co/',
        ownerId: user.id
      }

      console.log(beam_auth)
      // .then(() => {
      //   return beam.game.create(data)
      // })
      // .catch((error) => {
      //   console.log(error)
      // })
      // beam.game.create(data)
      // .then(res => {
      //   console.log(res)
      // })
      // .catch(err => {
      //   console.log(err)
      // })
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
    const { payload: { ownedGames } } = actions
    return {
      ...state,
      ownedGames: ownedGames
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
  ownedGames: []
}
export default function (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
