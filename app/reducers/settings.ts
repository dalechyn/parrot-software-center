import { SettingsActions } from '../actions'
import { createReducer } from '@reduxjs/toolkit'

export interface Settings {
  loadCVEs: boolean
}

export default createReducer<Settings>({ loadCVEs: true }, builder =>
  builder.addCase(SettingsActions.save, (state, { payload: { loadCVEs } }) => ({
    ...state,
    loadCVEs
  }))
)
