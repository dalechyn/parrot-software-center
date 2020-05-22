import { routerActions } from 'connected-react-router'
import * as alertActions from '../actions/alert'
import * as queueActions from '../actions/queue'
import * as searchResults from './reducers/searchResults'

export default {
  router: routerActions,
  alert: alertActions,
  queue: queueActions,
  searchResults: searchResults
}
