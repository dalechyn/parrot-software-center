import store from './index'
import { ThunkAction, ThunkDispatch } from '@reduxjs/toolkit'
import rootReducer from './root.reducer'

declare global {
  type Store = { [K in keyof typeof store]: ReturnType<typeof store[K]> }
  export type RootState = ReturnType<typeof rootReducer>
  export type AppDispatch = typeof store.dispatch
  export type RootAction = ReturnType<typeof store.dispatch>
}
