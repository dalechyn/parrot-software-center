import rootReducer from './root.reducer'

declare global {
  export type RootState = ReturnType<typeof rootReducer>
}

declare module '*.css' {
  interface ClassNames {
    [className: string]: string
  }
  const classNames: ClassNames
  export = classNames
}
