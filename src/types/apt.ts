import { QueueNode } from './queue'

export type CVEInfo = {
  critical: number
  high: number
  medium: number
  low: number
}
export type Sources = 'APT' | 'SNAP'
export type PackageSource = {
  packageSource: Sources
}
export type AptPackageRequiredFields = {
  name: string
  version: string
  maintainer: string
  description: string
}
export type AptPackageOptionalFields = Partial<{
  section: string
  priority: string
  essential: string
  architecture: string
  origin: string
  bugs: string
  homepage: string
  tag: string
  source: string
  depends: string
  preDepends: string
  recommends: string
  suggests: string
  breaks: string
  conflicts: string
  replaces: string
  provides: string
  installedSize: string
  downloadSize: string
  aptManualInstalled: string
  aptSources: string
}>
export type Review = {
  author: string
  rating: number
  commentary: string
}
export type PackageStatus = {
  installed: boolean
  upgradable: boolean
  upgradeQueued: boolean
} & Partial<Pick<QueueNode, 'flag'>>
export type PackagePreview = {
  name: string
  description: string
  cveInfo: CVEInfo
  icon: string
  version: string
} & PackageStatus &
  Pick<PackageEssentials, 'rating'> &
  PackageSource
export type PackageEssentials = {
  reviews: Review[]
  screenshots: string[]
  rating: number
}
export type AptPackage = AptPackageRequiredFields &
  AptPackageOptionalFields &
  PackageStatus &
  PackageEssentials
export type SnapChannel = {
  risk: string
  branch?: string
  version: string
}
export type SnapTrack = {
  name: string
  channels: SnapChannel[]
}
export type SnapPackage = {
  name: string
  summary: string
  publisher: string
  storeUrl: string
  contact: string
  license: string
  description: string
  snapId: string
  refreshDate?: string
  tracking?: string
  tracks: string[]
} & PackageEssentials &
  PackageStatus
export type AptPkgRegexRequired = {
  [K in keyof AptPackageRequiredFields]: RegExp
}
export type AptPkgRegexOptional = {
  [K in keyof Required<AptPackageOptionalFields>]: RegExp
}
