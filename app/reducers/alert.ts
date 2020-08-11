import { AlertActions } from '../actions'
import { createReducer } from '@reduxjs/toolkit'

export default createReducer('', builder =>
  builder
    .addCase(AlertActions.set, (_state, { payload }) => payload)
    .addCase(AlertActions.clear, () => '')
)
