import { AlertActions } from '../actions'
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
    try {
      const response = await fetch(`http://localhost:8000/login`, {
        method: 'POST',
        body: JSON.stringify({ login, password })
      })
      thunkAPI.dispatch(setToken((await response.json()).token))
    } catch (e) {
      thunkAPI.dispatch(AlertActions.set(e))
      throw e
    }
  }
)
export const register = createAsyncThunk(
  '@auth/REGISTER',
  async ({ email, login, password }: AuthInfo, thunkAPI) => {
    try {
      const res = await fetch(`http://localhost:8000/register`, {
        method: 'POST',
        body: JSON.stringify({ email, login, password })
      })
      if (!res.ok)
        thunkAPI.dispatch(
          AlertActions.set(new Error('There is already an account with that email or username'))
        )
    } catch (e) {
      thunkAPI.dispatch(AlertActions.set(e))
    }
  }
)
