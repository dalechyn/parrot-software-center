import { applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'
import { createLogger } from 'redux-logger'
import { routerMiddleware } from 'connected-react-router'
import history from '../history'

export default applyMiddleware(thunkMiddleware, routerMiddleware(history), createLogger())
