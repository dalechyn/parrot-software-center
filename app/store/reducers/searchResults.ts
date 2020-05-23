import { createReducer } from '@reduxjs/toolkit'
import { SearchResultsActions } from '../../actions'

export default createReducer({ page: 1, results: [], names: [] }, builder =>
  builder
    .addCase(SearchResultsActions.scroll, (state, { payload }) => ({ ...state, page: payload }))
    .addCase(SearchResultsActions.cacheResults, (state, { payload }) => ({
      ...state,
      results: payload
    }))
    .addCase(SearchResultsActions.cacheNames, (state, { payload }) => ({
      ...state,
      names: payload
    }))
)
