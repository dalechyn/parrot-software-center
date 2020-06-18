import { createAction } from '@reduxjs/toolkit'

export const set = createAction<Error>('@alert/SET')
export const clear = createAction('@alert/CLEAR')
