import { AlertActions } from '../../actions'
import { createReducer } from 'typesafe-actions'

export default createReducer('')
  .handleAction(AlertActions.set, (state, action) => action.payload)
  .handleAction(AlertActions.clear, (state, _) => '')
