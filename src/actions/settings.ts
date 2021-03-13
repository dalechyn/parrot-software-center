import { createAction } from '@reduxjs/toolkit'
import { Settings } from '../types/settings'

export const save = createAction<Settings>('@settings/SAVE')
