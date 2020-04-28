import { createStore } from 'redux'
import rootReducer from '../reducers'
import createMiddleware from '../middleware'
import { createBrowserHistory } from 'history'

export const history = createBrowserHistory()

export const configureStore = preloadedState =>
  createStore(rootReducer(history), preloadedState, createMiddleware(history))
