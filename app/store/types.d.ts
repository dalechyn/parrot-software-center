import { ActionType, StateType } from 'typesafe-actions'
import store from './index'

declare module 'typesafe-actions' {
  export type Store = StateType<typeof import('./index').default>
  export type RootState = StateType<typeof import('./root.reducer').default>
  export type RootAction = ActionType<typeof import('./root.actions').default>

  interface Types {
    RootAction: RootAction
  }
}
