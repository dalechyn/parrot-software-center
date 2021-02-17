import { AuthActions } from '../actions'
import { createReducer } from '@reduxjs/toolkit'

export default createReducer({ token: '', login: '', role: '' }, builder =>
  builder.addCase(AuthActions.setUserInfo, (_state, { payload }) => payload)
)
