import { createBrowserHistory, LocationState } from 'history'
import { Package } from '../pages/SearchResults/fetch'

export type MyLocationState = LocationState & {
  data?: Package
  searchQuery?: string
}

export default createBrowserHistory<MyLocationState>()
