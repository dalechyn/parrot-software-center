import { SearchResultActions } from '../../actions'
import { createReducer } from "typesafe-actions";

export default createReducer({page: 1, results: [], names: []})
  .handleAction(SearchResultActions.scroll, (state, { payload }) => ({ ...state, page: payload }))
  .handleAction(SearchResultActions.cacheResults, (state, { payload }) => ({...state, results: payload}))
  .handleAction(SearchResultActions.cacheNames, (state, { payload }) => ({...state, names: payload}))
