import { createAction } from '@reduxjs/toolkit'

export const set = createAction<string>('@alert/SET')
export const clear = createAction('@alert/CLEAR')
