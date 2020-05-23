import { AlertActions } from '../../actions'
import { createReducer } from '@reduxjs/toolkit'

export default createReducer('', builder =>
  builder
    .addCase(AlertActions.set, (state, action) => action.payload)
    .addCase(AlertActions.clear, () => '')
)
