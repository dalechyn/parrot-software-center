import { combineReducers } from 'redux'
import { connectRouter } from 'connected-react-router'
import history, { MyLocationState } from './history'

import { alert, queue } from './reducers'

const rootReducer = combineReducers({
  router: connectRouter<MyLocationState>(history),
  alert,
  queue
})

export default rootReducer
