import { searchResultsConstants } from '../constants'

export default (
  state = { page: 1, results: [], names: [] },
  { type, payload: { page, results, names } = {} }
) => {
  switch (type) {
    case searchResultsConstants.SET_PAGE:
      return { ...state, page }
    case searchResultsConstants.SET_RESULTS:
      return { ...state, results }
    case searchResultsConstants.SET_NAMES:
      return { ...state, names }
    default:
      return state
  }
}
