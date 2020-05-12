import { searchResultsConstants } from '../constants'

export default {
  setPage: page => ({ type: searchResultsConstants.SET_PAGE, payload: { page } }),
  setResults: results => ({
    type: searchResultsConstants.SET_RESULTS,
    payload: { results }
  }),
  setNames: names => ({ type: searchResultsConstants.SET_NAMES, payload: { names } })
}
