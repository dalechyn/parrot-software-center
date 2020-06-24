import { combineReducers } from 'redux'
import { connectRouter } from 'connected-react-router'
import history, { MyLocationState } from './history'

import { alert, auth, queue } from '../reducers'

const rootReducer = combineReducers({
  router: connectRouter<MyLocationState>(history),
  alert,
  auth,
  queue
})

export default rootReducer
