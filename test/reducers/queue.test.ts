import reducer from '../../src/reducers/queue'
import * as QueueActions from '../../src/actions/queue'
import { INSTALL, QueueNode, UNINSTALL } from '../../src/types/queue'

const initialState = {
  packages: Array<QueueNode>(),
  currentProgress: 0,
  globalProgress: 0,
  length: 0,
  isBusy: false
}

describe('queue reducer', () => {
  it('should add new package with install flag to the queue', () => {
    expect(
      reducer(
        initialState,
        QueueActions.install({
          name: 'hello',
          version: '1.0.0',
          source: 'APT'
        })
      )
    ).toEqual({
      ...initialState,
      length: 1,
      packages: [{ name: 'abc', flag: INSTALL }]
    })
  })

  it('should remove package from the queue if package is in queue with install flag', () => {
    expect(
      reducer(
        {
          ...initialState,
          length: 1,
          packages: [{ name: 'hello', flag: INSTALL, version: '1.0.0', source: 'APT' }]
        },
        QueueActions.uninstall({
          name: 'hello',
          version: '1.0.0',
          source: 'APT'
        })
      )
    ).toEqual(initialState)
  })

  it('should add new package with uninstall flag to the queue', () => {
    expect(
      reducer(
        initialState,
        QueueActions.uninstall({
          name: 'hello',
          version: '1.0.0',
          source: 'APT'
        })
      )
    ).toEqual({
      ...initialState,
      length: 1,
      packages: [{ name: 'abc', flag: UNINSTALL }]
    })
  })

  it('should remove package from the queue if if package is in queue with uninstall flag', () => {
    expect(
      reducer(
        {
          ...initialState,
          length: 1,
          packages: [{ name: 'hello', flag: INSTALL, version: '1.0.0', source: 'APT' }]
        },
        QueueActions.install({
          name: 'hello',
          version: '1.0.0',
          source: 'APT'
        })
      )
    ).toEqual(initialState)
  })
})
