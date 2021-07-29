import { createReducer } from '@reduxjs/toolkit'
import { UtilsActions } from '../actions'

export default createReducer<string[]>([], builder =>
  builder.addCase(UtilsActions.getIsolated.fulfilled, (_state, { payload }) => {
    return payload
  })
)
