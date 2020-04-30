import { searchResultsConstants } from '../constants'

const pageSet = page => ({ type: searchResultsConstants.PAGE_SET, page })

export default { pageSet: pageSet }
