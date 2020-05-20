import { QueueActions } from "../../actions";
import { createReducer } from "typesafe-actions";

const INSTALL = 'INSTALL'
const UNINSTALL = 'UNINSTALL'

interface QueueNode {
  name: string,
  version: string,
  flag: string
}

let newState: QueueNode[]

export default createReducer([])
  .handleAction(QueueActions.install, (state, action) => {
    newState = state.filter(
      ({ name, version, flag }) =>
        action.payload.name !== name ||
        action.payload.version !== version ||
        flag !== UNINSTALL
    )
    if (newState.length === state.length) {
      return [
        ...state,
        {
          name: action.payload.name,
          version: action.payload.version,
          flag: INSTALL
        }
      ]
    }
    return newState
  })
  .handleAction(QueueActions.uninstall, (state, action) => {
    newState = state.filter(
      ({ name, version, flag }) =>
        action.payload.name !== name ||
        action.payload.version !== version ||
        flag !== INSTALL
    )
    if (newState.length === state.length) {
      return [
        ...state,
        {
          name: action.payload.name,
          version: action.payload.version,
          flag: UNINSTALL
        }
      ]
    }
    return newState
  })
  .handleAction(QueueActions.swap, (state, action) => {
    newState = [...state]
    ;[newState[action.payload.first], newState[action.payload.second]] =
      [newState[action.payload.second], newState[action.payload.first]]
    return newState
  })
  .handleAction(QueueActions.remove, (state, action) => {
    newState = [...state]
    newState.splice(action.payload, 1)
    return newState
  })
