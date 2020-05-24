import { combineReducers } from 'redux'
import { connectRouter } from 'connected-react-router'
import history, { MyLocationState } from './history'

import { alert, queue, searchResults, apt } from './reducers'

const rootReducer = combineReducers({
  router: connectRouter<MyLocationState>(history),
  alert,
  queue,
  searchResults,
  apt
})

export default rootReducer
