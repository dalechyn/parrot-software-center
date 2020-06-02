import { QueueActions } from '../../actions'
import { createReducer } from '@reduxjs/toolkit'

export const INSTALL = 'INSTALL'
export const UNINSTALL = 'UNINSTALL'

export interface QueueNode {
  name: string
  flag: string
}

let newState: QueueNode[]

export default createReducer(Array<QueueNode>(), builder =>
  builder
    .addCase(QueueActions.install, (state, action) => {
      newState = state.filter(({ name, flag }) => action.payload !== name || flag !== UNINSTALL)
      if (newState.length === state.length) {
        return [
          ...state,
          {
            name: action.payload,
            flag: INSTALL
          }
        ]
      }
      return newState
    })
    .addCase(QueueActions.uninstall, (state, action) => {
      newState = state.filter(({ name, flag }) => action.payload !== name || flag !== INSTALL)
      if (newState.length === state.length) {
        return [
          ...state,
          {
            name: action.payload,
            flag: UNINSTALL
          }
        ]
      }
      return newState
    })
    .addCase(QueueActions.swap, (state, action) => {
      newState = [...state]
      ;[newState[action.payload.first], newState[action.payload.second]] = [
        newState[action.payload.second],
        newState[action.payload.first]
      ]
      return newState
    })
    .addCase(QueueActions.remove, (state, action) => {
      newState = [...state]
      newState.splice(action.payload, 1)
      return newState
    })
)
