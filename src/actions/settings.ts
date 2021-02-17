import { createAction } from '@reduxjs/toolkit'
import { Settings } from '../reducers/settings'

export const save = createAction<Settings>('@settings/SAVE')
