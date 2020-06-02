import { createAction } from '@reduxjs/toolkit'

export const swap = createAction<{
  first: number
  second: number
}>('@queue/SET')
export const remove = createAction<number>('@queue/REMOVE')
export const install = createAction<string>('@queue/INSTALL')
export const uninstall = createAction<string>('@queue/UNINSTALL')
