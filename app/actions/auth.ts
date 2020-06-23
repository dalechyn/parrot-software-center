import { AlertActions } from '../actions'
import { createAsyncThunk } from '@reduxjs/toolkit'

type AuthInfo = {
  email: string
  password: string
}
export const login = createAsyncThunk(
  '@auth/LOGIN',
  async ({ email, password }: AuthInfo, thunkAPI) => {
    try {
      const response = await fetch(`${APIUrl}/login`, { body: JSON.stringify({ email, password }) })
      return await response.json()
    } catch (e) {
      thunkAPI.dispatch(AlertActions.set(e))
      throw e
    }
  }
)
export const register = createAsyncThunk(
  '@auth/REGISTER',
  async ({ email, password }: AuthInfo, thunkAPI) => {
    try {
      const response = await fetch(`${APIUrl}/register`, {
        body: JSON.stringify({ email, password })
      })
      return await response.json()
    } catch (e) {
      thunkAPI.dispatch(AlertActions.set(e))
      throw e
    }
  }
)
