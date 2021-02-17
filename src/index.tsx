import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'connected-react-router'
import store from './store'
import './app.global.css'
import './i18n'
import history from './store/history'
import Root from './containers/Root'

document.addEventListener('DOMContentLoaded', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires,global-require
  // const Root = require('./containers/Root').default
  render(
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <Root />
      </ConnectedRouter>
    </Provider>,
    document.getElementById('root')
  )
})
