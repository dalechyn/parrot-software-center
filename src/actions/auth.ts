import { createAction, createAsyncThunk } from '@reduxjs/toolkit'
import keytar from 'keytar'
import os from 'os'

type AuthInfo = {
  login: string
  email?: string
  password: string
}

type UserInfo = {
  login: string
  accessToken: string
  refreshToken: string
  role: string
}

export const setUserInfo = createAction<UserInfo>('@auth/SET_USER_INFO')
export const login = createAsyncThunk<void, AuthInfo, { state: RootState }>(
  '@auth/LOGIN',
  async ({ login, password }, { dispatch, getState }) => {
    const res = await fetch(`${getState().settings.APIUrl}/login`, {
      method: 'POST',
      body: JSON.stringify({ login, password })
    })
    if (!res.ok) {
      if (res.status === 403)
        throw new Error(`This account is not confirmed. Follow email instructions to confirm it.`)
      else if (res.status === 401) throw new Error('Login and password are not accepted.')
      else if (res.status === 400) throw new Error('Username with that login does not exist')
      else throw new Error(res.statusText)
    }
    const userInfo = await res.json()
    dispatch(setUserInfo({ ...userInfo, login }))
    console.log('username', os.userInfo().username, userInfo.refreshToken)
    await keytar.setPassword(
      'parrot-software-center',
      os.userInfo().username,
      JSON.stringify({ ...userInfo, login })
    )
  }
)
export const register = createAsyncThunk<void, AuthInfo, { state: RootState }>(
  '@auth/REGISTER',
  async ({ email, login, password }, { getState }) => {
    const res = await fetch(`${getState().settings.APIUrl}/register`, {
      method: 'POST',
      body: JSON.stringify({ email, login, password })
    })
    if (!res.ok) {
      if (res.status === 400)
        throw new Error('There is already an account with that email or username')
      else throw new Error(res.statusText)
    }
  }
)
export const getLocalUserInfo = createAsyncThunk<void, void, { state: RootState }>(
  '@auth/GET_LOCAL_USER_INFO',
  async (_, { dispatch }) => {
    const userInfoSerialized = await keytar.getPassword(
      'parrot-software-center',
      os.userInfo().username
    )
    if (!userInfoSerialized) throw new Error('No local user info was found')
    dispatch(setUserInfo(JSON.parse(userInfoSerialized)))
  }
)
