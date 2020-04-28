import { applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'
import { createLogger } from 'redux-logger'
import { routerMiddleware } from 'connected-react-router'

export default history =>
  applyMiddleware(thunkMiddleware, routerMiddleware(history), createLogger())
