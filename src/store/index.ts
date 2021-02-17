import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit'
import { routerMiddleware } from 'connected-react-router'
import logger from 'redux-logger'
import { Middleware } from 'redux'
import history from './history'
import rootReducer from './root.reducer'
// rehydrate state on src start
const initialState = {}

// create store
const store = configureStore({
  reducer: rootReducer,
  preloadedState: initialState,
  devTools: true,
  middleware: [
    routerMiddleware(history),
    logger as Middleware,
    ...getDefaultMiddleware<RootState>()
  ] as const
})

// export store singleton instance
export default store
