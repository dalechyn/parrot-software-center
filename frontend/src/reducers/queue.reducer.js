import { queueConstants } from '../constants'

export default (state = [], { type, payload }) => {
  let newState
  switch (type) {
    case queueConstants.INSTALL:
      newState = state.filter(
        ({ name: pkgName, version: pkgVersion, flag }) =>
          pkgName !== payload.name ||
          pkgVersion !== payload.version ||
          flag !== queueConstants.UNINSTALL
      )
      if (newState.length === state.length) {
        return [
          ...state,
          {
            name: payload.name,
            version: payload.version,
            flag: queueConstants.INSTALL
          }
        ]
      }
      return newState
    case queueConstants.UNINSTALL:
      newState = state.filter(
        ({ name: pkgName, version: pkgVersion, flag }) =>
          pkgName !== payload.name ||
          pkgVersion !== payload.version ||
          flag !== queueConstants.INSTALL
      )
      if (newState.length === state.length) {
        return [
          ...state,
          {
            name: payload.name,
            version: payload.version,
            flag: queueConstants.UNINSTALL
          }
        ]
      }
      return newState
    default:
      return state
  }
}
