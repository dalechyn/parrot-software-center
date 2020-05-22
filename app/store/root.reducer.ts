import { combineReducers } from 'redux'
import { connectRouter } from 'connected-react-router'
import history from './history'

import { alert, queue, searchResults } from './reducers'

const rootReducer = combineReducers({
  router: connectRouter(history),
  alert,
  queue,
  searchResults
})

export default rootReducer
