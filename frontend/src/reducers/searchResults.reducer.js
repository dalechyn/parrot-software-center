import { searchResultsConstants } from '../constants'

export default (state = { page: 1 }, { type, payload }) => {
  switch (type) {
    case searchResultsConstants.PAGE_SET:
      return { page: payload.page }
    default:
      return state
  }
}
