import { createAction } from 'typesafe-actions'

export const set = createAction('@alert/SET')<string>()
export const clear = createAction('@alert/CLEAR')()
