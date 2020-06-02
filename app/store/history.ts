import { createBrowserHistory, LocationState } from 'history'
import { Package } from '../containers/PackageInfo'

export type MyLocationState = LocationState & {
  page: number
  installed: boolean
  imageUrl: string
  rest: Package
} & Package

export default createBrowserHistory<MyLocationState>()
