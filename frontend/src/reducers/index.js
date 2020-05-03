import { combineReducers } from 'redux'
import { connectRouter } from 'connected-react-router'

import alert from './alert.reducer'
import tokens from './tokens.reducer'
import searchResults from './searchResults.reducer'
import queue from './queue.reducer'

const rootReducer = history =>
  combineReducers({
    router: connectRouter(history),
    tokens,
    alert,
    searchResults,
    queue
  })

export default rootReducer
