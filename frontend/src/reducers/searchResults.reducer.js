import { searchResultsConstants } from '../constants'

export default (state = { page: 1 }, action) => {
  switch (action.type) {
    case searchResultsConstants.PAGE_SET:
      return { page: action.page }
    default:
      return state
  }
}
