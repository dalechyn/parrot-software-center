import { queueConstants } from '../constants'

export default (
  state = [],
  { type, payload: { name, version, first, second, delIndex } = {} }
) => {
  let newState
  switch (type) {
    case queueConstants.INSTALL:
      newState = state.filter(
        ({ name: pkgName, version: pkgVersion, flag }) =>
          pkgName !== name || pkgVersion !== version || flag !== queueConstants.UNINSTALL
      )
      if (newState.length === state.length) {
        return [
          ...state,
          {
            name,
            version,
            flag: queueConstants.INSTALL
          }
        ]
      }
      return newState
    case queueConstants.UNINSTALL:
      newState = state.filter(
        ({ name: pkgName, version: pkgVersion, flag }) =>
          pkgName !== name || pkgVersion !== version || flag !== queueConstants.INSTALL
      )
      if (newState.length === state.length) {
        return [
          ...state,
          {
            name,
            version,
            flag: queueConstants.UNINSTALL
          }
        ]
      }
      return newState
    case queueConstants.SWAP:
      newState = [...state]
      ;[newState[first], newState[second]] = [newState[second], newState[first]]
      return newState
    case queueConstants.DELETE:
      newState = [...state]
      newState.splice(delIndex, 1)
      return newState
    default:
      return state
  }
}
