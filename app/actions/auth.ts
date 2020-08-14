import { createAction, createAsyncThunk } from '@reduxjs/toolkit'

type AuthInfo = {
  login: string
  email?: string
  password: string
}

type UserInfo = {
  login: string
  token: string
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
      else
        throw new Error(
          `There is already an account with that email or username, or it doesn't exist.`
        )
    }
    dispatch(setUserInfo({ token: (await res.json()).token, login }))
  }
)
export const register = createAsyncThunk<void, AuthInfo, { state: RootState }>(
  '@auth/REGISTER',
  async ({ email, login, password }, { getState }) => {
    const res = await fetch(`${getState().settings.APIUrl}/register`, {
      method: 'POST',
      body: JSON.stringify({ email, login, password })
    })
    if (!res.ok) throw new Error('There is already an account with that email or username')
  }
)
