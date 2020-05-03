import { searchResultsConstants } from '../constants'

export default {
  pageSet: page => ({ type: searchResultsConstants.PAGE_SET, payload: { page } })
}
