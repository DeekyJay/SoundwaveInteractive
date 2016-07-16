import storage from 'electron-json-storage'
import { toastr } from 'redux-toastr'
import _ from 'lodash'
import DevLabUtil from '../utils/DevLabUtil'

// Constants
export const constants = {
  SHOW_BOARD: 'SHOW_BOARD',
  EDIT_BOARD: 'EDIT_BOARD',
  ADD_BUTTON_TO_BOARD: 'ADD_BUTTON_TO_BOARD',
  UPDATE_GRID: 'UPDATE_GRID'
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
  buttons_left: 100
}
export default function (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
