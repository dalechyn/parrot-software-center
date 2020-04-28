import { tokenConstants } from '../constants'

export default (
  state = {
    token: localStorage.getItem('accessToken')
  },
  action
) => {
  switch (action.type) {
    case tokenConstants.TOKEN_REQUEST:
      return {}
    case tokenConstants.TOKEN_SUCCESS:
      return {
        token: action.token
      }
    case tokenConstants.TOKEN_FAILURE:
      return {}
    default:
      return state
  }
}
