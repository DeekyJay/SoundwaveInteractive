import { combineReducers } from 'redux'
import { routerReducer as router } from 'react-router-redux'
import { reducer as formReducer } from 'redux-form'
import {reducer as toastrReducer} from 'redux-toastr'
import auth from './modules/Authentication'
import app from './modules/App'
import ui from './modules/UI'
import sounds from './modules/Sounds'

export default combineReducers({
  app,
  ui,
  auth,
  sounds,
  router,
  form: formReducer,
  toastr: toastrReducer
})
