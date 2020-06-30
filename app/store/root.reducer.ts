import { combineReducers } from 'redux'
import { connectRouter } from 'connected-react-router'
import history, { MyLocationState } from './history'

import { alert, auth, queue, settings } from '../reducers'

const rootReducer = combineReducers({
  router: connectRouter<MyLocationState>(history),
  alert,
  auth,
  queue,
  settings
})

export default rootReducer
