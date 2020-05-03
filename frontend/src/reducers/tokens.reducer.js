import { tokenConstants } from '../constants'

export default (
  state = {
    token: localStorage.getItem('accessToken')
  },
  { type, payload }
) => {
  switch (type) {
    case tokenConstants.TOKEN_REQUEST:
      return {}
    case tokenConstants.TOKEN_SUCCESS:
      return {
        token: payload.token
      }
    case tokenConstants.TOKEN_FAILURE:
      return {}
    default:
      return state
  }
}
