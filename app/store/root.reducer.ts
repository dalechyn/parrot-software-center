import { combineReducers } from 'redux'
import { connectRouter } from 'connected-react-router'
import history from './history'

import { alert, auth, queue, settings } from '../reducers'

const rootReducer = combineReducers({
  router: connectRouter(history),
  alert,
  auth,
  queue,
  settings
})

export default rootReducer
