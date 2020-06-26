import { createAction, createAsyncThunk } from '@reduxjs/toolkit'

type AuthInfo = {
  login: string
  email?: string
  password: string
}
export const setToken = createAction<string>('@auth/SET_TOKEN')
export const login = createAsyncThunk(
  '@auth/LOGIN',
  async ({ login, password }: AuthInfo, thunkAPI) => {
    const res = await fetch(`http://localhost:8000/login`, {
      method: 'POST',
      body: JSON.stringify({ login, password })
    })
    if (!res.ok)
      throw new Error(
        `There is already an account with that email or username, or it doesn't exist`
      )
    thunkAPI.dispatch(setToken((await res.json()).token))
  }
)
export const register = createAsyncThunk(
  '@auth/REGISTER',
  async ({ email, login, password }: AuthInfo) => {
    const res = await fetch(`http://localhost:8000/register`, {
      method: 'POST',
      body: JSON.stringify({ email, login, password })
    })
    if (!res.ok) throw new Error('There is already an account with that email or username')
  }
)
