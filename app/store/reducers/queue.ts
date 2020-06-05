import { AptActions, QueueActions } from '../../actions'
import { createReducer } from '@reduxjs/toolkit'

export const INSTALL = 'INSTALL'
export const UNINSTALL = 'UNINSTALL'

export interface QueueNode {
  name: string
  flag: string
}

export default createReducer(
  {
    packages: Array<QueueNode>(),
    currentProgress: 0,
    globalProgress: 0,
    isBusy: false
  },
  builder =>
    builder
      .addCase(QueueActions.install, (state, { payload }) => {
        const queue = state.packages.filter(
          ({ name, flag }) => payload !== name || flag !== UNINSTALL
        )
        if (queue.length === state.packages.length) {
          state.packages = [
            ...state.packages,
            {
              name: payload,
              flag: INSTALL
            }
          ]
          return state
        }
        return state
      })
      .addCase(QueueActions.uninstall, (state, { payload }) => {
        const queue = state.packages.filter(
          ({ name, flag }) => payload !== name || flag !== INSTALL
        )
        if (queue.length === state.packages.length) {
          state.packages = [
            ...state.packages,
            {
              name: payload,
              flag: UNINSTALL
            }
          ]
          return state
        }
        return state
      })
      .addCase(QueueActions.swap, (state, { payload }) => {
        const queue = [...state.packages]
        ;[queue[payload.first], queue[payload.second]] = [
          queue[payload.second],
          queue[payload.first]
        ]
        state.packages = queue
        return state
      })
      .addCase(QueueActions.remove, (state, { payload }) => {
        const queue = [...state.packages]
        queue.splice(payload, 1)
        state.packages = queue
        return state
      })
      .addCase(AptActions.install.pending, state => {
        state.globalProgress++
        return state
      })
      .addCase(AptActions.install.fulfilled, state => {
        state.currentProgress = 0
        state.packages.shift()
        if (state.packages.length === 0) state.globalProgress = 0
        return state
      })
      .addCase(AptActions.uninstall.pending, state => {
        state.globalProgress++
        return state
      })
      .addCase(AptActions.uninstall.fulfilled, state => {
        state.currentProgress = 0
        state.packages.shift()
        if (state.packages.length === 0) state.globalProgress = 0
      })
)
