import { createAction } from '@reduxjs/toolkit'

export const swap = createAction<{
  first: number
  second: number
}>('@queue/SET')
export const remove = createAction<number>('@queue/REMOVE')
export const install = createAction<{
  name: string
  version: string
}>('@queue/INSTALL')
export const uninstall = createAction<{
  name: string
  version: string
}>('@queue/UNINSTALL')
