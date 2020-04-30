import { combineReducers } from 'redux'
import { connectRouter } from 'connected-react-router'

import alert from './alert.reducer'
import tokens from './tokens.reducer'
import searchResults from './searchResults.reducer'

const rootReducer = history =>
  combineReducers({
    router: connectRouter(history),
    tokens,
    alert,
    searchResults
  })

export default rootReducer
