export type QueueNodeMeta = {
  name: string
  version: string
  oldVersion?: string
  source: 'APT' | 'SNAP'
}
export const INSTALL = 'install'
export const UPGRADE = '--only-upgrade install'
export const UNINSTALL = 'remove'
export type QueueNode = QueueNodeMeta & {
  flag: typeof INSTALL | typeof UNINSTALL | typeof UPGRADE | null
}
