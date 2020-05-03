import { alertConstants } from '../constants'

export default (state = '', { type, payload }) => {
  switch (type) {
    case alertConstants.SET:
      return payload.message
    case alertConstants.CLEAR:
      return ''
    default:
      return state
  }
}
