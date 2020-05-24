import store from './index'

declare global {
  type Store = { [K in keyof typeof store]: ReturnType<typeof store[K]> }
  export type RootState = ReturnType<typeof store.getState>
  export type RootAction = ReturnType<typeof store.dispatch>
}
