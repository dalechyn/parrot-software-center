import { createAction, createAsyncThunk } from '@reduxjs/toolkit'

type AuthInfo = {
  login: string
  email?: string
  password: string
}
export const setToken = createAction<string>('@auth/SET_TOKEN')
export const login = createAsyncThunk<void, AuthInfo, { state: RootState }>(
  '@auth/LOGIN',
  async ({ login, password }, { dispatch, getState }) => {
    const res = await fetch(`${getState().settings.APIUrl}/login`, {
      method: 'POST',
      body: JSON.stringify({ login, password })
    })
    if (!res.ok)
      throw new Error(
        `There is already an account with that email or username, or it doesn't exist`
      )
    dispatch(setToken((await res.json()).token))
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
