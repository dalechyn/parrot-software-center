import { createReducer } from '@reduxjs/toolkit'
import * as QueueActions from '../actions/queue'
import * as AptActions from '../actions/apt'
import { INSTALL, QueueNode, UNINSTALL, UPGRADE } from '../types/queue'

export default createReducer(
  {
    packages: Array<QueueNode>(),
    currentProgress: 0,
    globalProgress: 0,
    length: 0,
    isBusy: false
  },
  builder =>
    builder
      .addCase(QueueActions.install, (state, { payload: { name, version, source } }) => {
        const queue = state.packages.filter(
          ({ name: filterName, source: filterSource, flag }) =>
            !(filterName === name && filterSource === source && flag === UNINSTALL)
        )
        if (queue.length === state.packages.length) {
          state.packages = [
            ...state.packages,
            {
              name,
              version,
              source,
              flag: INSTALL
            }
          ]
          state.length++
          return state
        }
        state.packages = queue
        state.length--
        return state
      })
      .addCase(QueueActions.uninstall, (state, { payload: { name, version, source } }) => {
        const queue = state.packages.filter(
          ({ name: filterName, source: filterSource, flag }) =>
            !(filterName === name && filterSource === source && flag === INSTALL)
        )
        if (queue.length === state.packages.length) {
          state.packages = [
            ...state.packages,
            {
              name,
              version,
              source,
              flag: UNINSTALL
            }
          ]
          state.length++
          return state
        }
        state.packages = queue
        state.length--
        return state
      })
      .addCase(QueueActions.upgrade, (state, { payload: { name, version, source } }) => {
        state.packages = [
          ...state.packages,
          {
            name,
            version,
            source,
            flag: UPGRADE
          }
        ]
        state.length++
        return state
      })
      .addCase(QueueActions.dontUpgrade, (state, { payload: { name, source } }) => {
        state.packages = state.packages.filter(
          ({ name: filterName, source: filterSouce, flag }) =>
            !(filterName === name && filterSouce === source && flag === UPGRADE)
        )
        state.length--
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
        state.length--
        state.packages = queue
        return state
      })
      .addCase(QueueActions.pop, state => {
        state.currentProgress = 0
        state.packages.shift()
        if (state.packages.length !== 0) state.globalProgress++
        else {
          state.globalProgress = 0
          state.isBusy = false
          state.length = 0
        }
        return state
      })
      .addCase(AptActions.perform.pending, state => {
        state.globalProgress++
        state.length = state.packages.length
        state.isBusy = true
        return state
      })
      .addCase(AptActions.perform.fulfilled, state => {
        state.globalProgress = 0
        state.isBusy = false
        state.length = 0
        return state
      })
      .addCase(AptActions.perform.rejected, state => {
        state.globalProgress = 0
        state.isBusy = false
        state.length = 0
        return state
      })
)
