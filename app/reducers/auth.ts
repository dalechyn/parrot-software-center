import { AuthActions } from '../actions'
import { createReducer } from '@reduxjs/toolkit'

export default createReducer({ token: '' }, builder =>
  builder.addCase(AuthActions.setToken, (_state, action) => ({
    token: action.payload
  }))
)
