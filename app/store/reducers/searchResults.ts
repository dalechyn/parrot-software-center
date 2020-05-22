import { SearchResultsActions } from '../../actions'
import { createReducer } from 'typesafe-actions'

export default createReducer({ page: 1, results: [], names: [] })
  .handleAction(SearchResultsActions.scroll, (state, { payload }) => ({ ...state, page: payload }))
  .handleAction(SearchResultsActions.cacheResults, (state, { payload }) => ({
    ...state,
    results: payload
  }))
  .handleAction(SearchResultsActions.cacheNames, (state, { payload }) => ({
    ...state,
    names: payload
  }))
