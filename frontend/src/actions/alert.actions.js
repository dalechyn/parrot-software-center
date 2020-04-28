import { alertConstants } from '../constants'

const set = message => ({ type: alertConstants.SET, message })
const clear = () => ({ type: alertConstants.CLEAR })

export default {
  set,
  clear
}
