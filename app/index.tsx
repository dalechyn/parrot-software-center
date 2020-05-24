import React, { Fragment, useMemo } from 'react'
import { Provider } from 'react-redux'
import { ThemeProvider, CssBaseline, createMuiTheme, useMediaQuery } from '@material-ui/core'
import { blue } from '@material-ui/core/colors'
import { render } from 'react-dom'
import { SnackbarProvider } from 'notistack'
import { ConnectedRouter } from 'connected-react-router'
import { AppContainer as ReactHotAppContainer } from 'react-hot-loader'
import store from './store'
import history from './store/history'
import './app.global.css'
import { Header } from './components'
import Routes from './Routes'

const AppContainer = process.env.PLAIN_HMR ? Fragment : ReactHotAppContainer
const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')

const theme = useMemo(
  () =>
    createMuiTheme({
      palette: {
        primary: blue,
        secondary: {
          main: blue[50]
        },
        type: prefersDarkMode ? 'dark' : 'light'
      },
      typography: {
        fontFamily: 'Hack'
      }
    }),
  [prefersDarkMode]
)

document.addEventListener('DOMContentLoaded', () =>
  render(
    <AppContainer>
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <SnackbarProvider maxSnack={3}>
            <CssBaseline />
            <ConnectedRouter history={history}>
              <Header />
              <Routes />
            </ConnectedRouter>
          </SnackbarProvider>
        </ThemeProvider>
      </Provider>
    </AppContainer>,
    document.getElementById('root')
  )
)
