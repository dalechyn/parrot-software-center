import * as QueueActions from '../actions/queue'
import * as AptActions from '../actions/apt'
import { createReducer } from '@reduxjs/toolkit'
import { QueueNode } from '../containers/Queue'

export const INSTALL = 'install'
export const UPGRADE = '--only-upgrade install'
export const UNINSTALL = 'purge'

export default createReducer(
  {
    packages: Array<QueueNode>(),
    currentProgress: 0,
    globalProgress: 0,
    isBusy: false,
    upgradeProgress: 0
  },
  builder => {
    return builder
      .addCase(QueueActions.install, (state, { payload }) => {
        const queue = state.packages.filter(
          ({ name, flag }) => !(payload === name && flag === INSTALL)
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
        } else state.packages = queue
        return state
      })
      .addCase(QueueActions.uninstall, (state, { payload }) => {
        const queue = state.packages.filter(
          ({ name, flag }) => !(payload === name && flag === UNINSTALL)
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
        } else state.packages = queue
        return state
      })
      .addCase(QueueActions.upgrade, (state, { payload }) => {
        state.packages = [
          ...state.packages,
          {
            name: payload,
            flag: UPGRADE
          }
        ]
        return state
      })
      .addCase(QueueActions.dontUpgrade, (state, { payload }) => {
        state.packages = state.packages.filter(
          ({ name, flag }) => !(payload === name && flag === UPGRADE)
        )
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
      .addCase(QueueActions.pop, state => {
        state.currentProgress = 0
        state.packages.shift()
        if (state.packages.length !== 0) state.globalProgress++
        return state
      })
      .addCase(AptActions.process.pending, state => {
        state.globalProgress++
        state.isBusy = true
        return state
      })
      .addCase(AptActions.process.fulfilled, state => {
        state.globalProgress = 0
        state.isBusy = false
        return state
      })
  }
)
