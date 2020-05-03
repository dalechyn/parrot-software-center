import { alertConstants } from '../constants'

export default {
  set: message => ({ type: alertConstants.SET, payload: { message } }),
  clear: () => ({ type: alertConstants.CLEAR })
}
