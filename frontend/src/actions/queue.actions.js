import { queueConstants } from '../constants'

export default {
  queue: (name, version) => ({
    type: queueConstants.INSTALL,
    payload: { name, version }
  }),
  dequeue: (name, version) => ({
    type: queueConstants.UNINSTALL,
    payload: { name, version }
  })
}
