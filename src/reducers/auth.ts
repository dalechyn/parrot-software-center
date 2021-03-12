import { createReducer } from '@reduxjs/toolkit'
import keytar from 'keytar'
import os from 'os'
import { AuthActions } from '../actions'

const refreshTokens = async () => {
  const [accessToken, refreshToken] = await Promise.all([
    keytar.getPassword('parrot-software-center-access', os.userInfo().username),
    keytar.getPassword('parrot-software-center-refresh', os.userInfo().username)
  ])
  if (refreshToken) AuthActions.setUserInfo({ login: '', refreshToken, accessToken, role: '' })
}

export default createReducer({ accessToken: '', refreshToken: '', login: '', role: '' }, builder =>
  builder.addCase(AuthActions.setUserInfo, (_state, { payload }) => {
    return payload
  })
)

refreshTokens()
