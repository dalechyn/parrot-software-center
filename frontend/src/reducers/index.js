import { combineReducers } from 'redux'
import { connectRouter } from 'connected-react-router'

import alert from './alert.reducer'
import tokens from './tokens.reducer'

const rootReducer = history =>
  combineReducers({
    router: connectRouter(history),
    tokens,
    alert
  })

export default rootReducer
