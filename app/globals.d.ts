import rootReducer from './store/root.reducer'

declare global {
  export const APIUrl = 'http://localhost:8000'
  export type RootState = ReturnType<typeof rootReducer>
}

declare module '*.css' {
  interface ClassNames {
    [className: string]: string
  }
  const classNames: ClassNames
  export = classNames
}
