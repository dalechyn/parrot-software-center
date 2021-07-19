import { combineReducers } from 'redux'
import { connectRouter } from 'connected-react-router'
import history from './history'
import { alert, auth, queue, previews, settings, isolate } from '../reducers'

const rootReducer = combineReducers({
  router: connectRouter(history),
  alert,
  auth,
  queue,
  settings,
  previews,
  isolate
})

export default rootReducer
