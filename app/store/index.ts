import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit'
import rootReducer from './root.reducer'
import { routerMiddleware } from 'connected-react-router'
import history from './history'
import logger from 'redux-logger'
import { Middleware } from 'redux'
// rehydrate state on app start
const initialState = {}

// create store
const store = configureStore({
  reducer: rootReducer,
  preloadedState: initialState,
  devTools: true,
  middleware: [...getDefaultMiddleware(), routerMiddleware(history), logger as Middleware]
})

// export store singleton instance
export default store
