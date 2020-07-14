import { createHashHistory, LocationState } from 'history'
import { Package } from '../containers/PackageInfo'

export type MyLocationState = LocationState & {
  page: number
  installed: boolean
  upgradable: boolean
  imageUrl: string
  rest: Package
} & Package

export default createHashHistory<MyLocationState>()
