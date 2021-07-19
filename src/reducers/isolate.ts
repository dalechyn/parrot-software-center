import { createReducer } from '@reduxjs/toolkit'
import { getIsolated } from '../actions/apt'

const initialState = { 
  packages: Array<string>()
}

export default createReducer(initialState, builder => 
  builder
  .addCase(getIsolated.fulfilled, (state, action) => {
    state.packages = action.payload;
  })
)