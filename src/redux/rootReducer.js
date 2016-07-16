import { combineReducers } from 'redux'
import { routerReducer as router } from 'react-router-redux'
import { reducer as formReducer } from 'redux-form'
import {reducer as toastrReducer} from 'redux-toastr'
import auth from './modules/Authentication'
import app from './modules/App'
import ui from './modules/UI'
import profiles from './modules/Profiles'
import sounds from './modules/Sounds'
import board from './modules/Board'

export default combineReducers({
  app,
  ui,
  auth,
  profiles,
  sounds,
  board,
  router,
  form: formReducer,
  toastr: toastrReducer
})
