import { createAction } from '@reduxjs/toolkit'
import { QueueNodeMeta } from '../types/queue'

export const swap = createAction<{
  first: number
  second: number
}>('@queue/SET')
export const remove = createAction<number>('@queue/REMOVE')
export const install = createAction<QueueNodeMeta>('@queue/INSTALL')
export const uninstall = createAction<QueueNodeMeta>('@queue/UNINSTALL')
export const upgrade = createAction<QueueNodeMeta>('@queue/UPGRADE')
export const dontUpgrade = createAction<QueueNodeMeta>('@queue/DONT_UPGRADE')
export const process = createAction('@queue/PROCESS')
export const pop = createAction('@queue/POP')
