import { createReducer } from '@reduxjs/toolkit'
import { AuthActions } from '../actions'

export default createReducer({ accessToken: '', refreshToken: '', login: '', role: '' }, builder =>
  builder.addCase(AuthActions.setUserInfo, (_state, { payload }) => {
    return payload
  })
)
