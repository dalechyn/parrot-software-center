import React, { Fragment, Suspense } from 'react'
import { render } from 'react-dom'
import { AppContainer as ReactHotAppContainer } from 'react-hot-loader'
import { Provider } from 'react-redux'
import store from './store'
import './app.global.css'
import './i18n' // import i18n.js

const AppContainer = process.env.PLAIN_HMR ? Fragment : ReactHotAppContainer

document.addEventListener('DOMContentLoaded', () => {
  // eslint-disable-next-line global-require
  const Root = require('./containers/Root').default
  render(
    <Suspense fallback={<div>Loading...</div>}>
      <AppContainer>
        <Provider store={store}>
          <Root useSuspense={true} />
        </Provider>
      </AppContainer>
    </Suspense>,
    document.getElementById('root')
  )
})
