import { queueConstants } from '../constants'

export default {
  swap: (first, second) => ({
    type: queueConstants.SWAP,
    payload: { first, second }
  }),
  delete: delIndex => ({
    type: queueConstants.DELETE,
    payload: { delIndex }
  }),
  queue: (name, version) => ({
    type: queueConstants.INSTALL,
    payload: { name, version }
  }),
  dequeue: (name, version) => ({
    type: queueConstants.UNINSTALL,
    payload: { name, version }
  })
}
