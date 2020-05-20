import { createAction } from 'typesafe-actions'

export const swap = createAction('@queue/SET')<{
  first:number
  second:number
}>()
export const remove = createAction('@queue/REMOVE')<number>()
export const install = createAction('@queue/INSTALL')<{
  name: string
  version: string
}>()
export const uninstall = createAction('@queue/UNINSTALL')<{
  name: string
  version: string
}>()
