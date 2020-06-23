import rootReducer from './root.reducer'

declare global {
  export type RootState = ReturnType<typeof rootReducer>
  export const APIUrl = 'http://localhost:8000'
}

declare module '*.css' {
  interface ClassNames {
    [className: string]: string
  }
  const classNames: ClassNames
  export = classNames
}
