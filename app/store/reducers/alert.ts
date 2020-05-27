import { AlertActions } from '../../actions'
import { createReducer } from '@reduxjs/toolkit'

export default createReducer('', builder =>
  builder
    .addCase(AlertActions.set, (_state, action) => action.payload)
    .addCase(AlertActions.clear, () => '')
)
