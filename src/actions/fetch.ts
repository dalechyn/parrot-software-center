import { createAsyncThunk } from '@reduxjs/toolkit'
import keytar from 'keytar'
import os from 'os'
import { setUserInfo } from './auth'

export const fetchAuthorized = createAsyncThunk<
  Response,
  { input: RequestInfo; payload: Record<string, unknown>; method?: string },
  { state: RootState }
>('@fetch/AUTHORIZED_FETCH', async ({ input, payload, method }, { getState, dispatch }) => {
  const state = getState()
  const first = await fetch(input, {
    method: method ?? 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      ...payload,
      token: state.auth.accessToken
    })
  })
  // accessToken expired
  if (first.status === 401) {
    // refresh tokens
    const second = await fetch(`${state.settings.APIUrl}/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refreshToken: state.auth.refreshToken })
    })
    if (second.status === 200) {
      const { refreshToken, accessToken } = await second.json()
      await Promise.all([
        keytar.setPassword('parrot-software-center-refresh', os.userInfo().username, refreshToken),
        keytar.setPassword('parrot-software-center-access', os.userInfo().username, accessToken)
      ])
      dispatch(setUserInfo({ ...state.auth, refreshToken, accessToken }))
      return fetch(input, {
        method: method ?? 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...payload,
          token: accessToken
        })
      })
    }
    return second
  }
  return first
})
