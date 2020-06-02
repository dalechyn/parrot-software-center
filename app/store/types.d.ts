import rootReducer from './root.reducer'

declare global {
  export type RootState = ReturnType<typeof rootReducer>
}
