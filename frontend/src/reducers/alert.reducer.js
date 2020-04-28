import { alertConstants } from '../constants'

export default (state = '', action) => {
  switch (action.type) {
    case alertConstants.SET:
      return action.message
    case alertConstants.CLEAR:
      return ''
    default:
      return state
  }
}
