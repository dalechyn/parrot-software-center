import { createAsyncThunk } from '@reduxjs/toolkit'

export const getIsolated = createAsyncThunk<string[], void, { state: RootState }>(
  '@utils/GET_ISOLATED',
  async (_state, { getState }) => {
    const state = getState()
    const res = await fetch(`${state.settings.APIUrl}/isolated`)
    return (await res.json()).packages
  }
)
