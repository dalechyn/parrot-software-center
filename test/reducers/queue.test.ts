import reducer from '../../app/reducers/queue'
import { QueueNode } from '../../app/containers/Queue'
import * as QueueActions from '../../app/actions/queue'
import { INSTALL, UNINSTALL } from '../../app/actions/apt'

const initialState = {
  packages: Array<QueueNode>(),
  currentProgress: 0,
  globalProgress: 0,
  length: 0,
  isBusy: false
}

describe('queue reducer', () => {
  it('should add new package with install flag to the queue', () => {
    expect(reducer(initialState, QueueActions.install('abc'))).toEqual({
      ...initialState,
      length: 1,
      packages: [{ name: 'abc', flag: INSTALL }]
    })
  })

  it('should remove package from the queue if package is in queue with install flag', () => {
    expect(
      reducer(
        { ...initialState, length: 1, packages: [{ name: 'abc', flag: INSTALL }] },
        QueueActions.uninstall('abc')
      )
    ).toEqual(initialState)
  })

  it('should add new package with uninstall flag to the queue', () => {
    expect(reducer(initialState, QueueActions.uninstall('abc'))).toEqual({
      ...initialState,
      length: 1,
      packages: [{ name: 'abc', flag: UNINSTALL }]
    })
  })

  it('should remove package from the queue if if package is in queue with uninstall flag', () => {
    expect(
      reducer(
        { ...initialState, length: 1, packages: [{ name: 'abc', flag: UNINSTALL }] },
        QueueActions.install('abc')
      )
    ).toEqual(initialState)
  })
})
