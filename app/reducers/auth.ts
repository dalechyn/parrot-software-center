import { AuthActions } from '../actions'
import { createReducer } from '@reduxjs/toolkit'

export default createReducer({ token: '', login: '' }, builder =>
  builder.addCase(AuthActions.setUserInfo, (_state, { payload }) => payload)
)
