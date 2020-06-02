import React, { useMemo } from 'react'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'connected-react-router'
import { hot } from 'react-hot-loader/root'
import history from '../../store/history'
import store from '../../store'
import Routes from './Routes'
import { Header } from '../../components'
import { createMuiTheme, CssBaseline, ThemeProvider, useMediaQuery } from '@material-ui/core'
import { SnackbarProvider } from 'notistack'
import { blue } from '@material-ui/core/colors'

const Root = () => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')

  const theme = useMemo(
    () =>
      createMuiTheme({
        palette: {
          primary: blue,
          secondary: {
            main: blue[50]
          },
          type: /*prefersDarkMode ?*/ 'dark' /* : 'light'*/
        },
        typography: {
          fontFamily: 'Hack'
        }
      }),
    [prefersDarkMode]
  )

  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <SnackbarProvider maxSnack={3}>
          <CssBaseline />
          <Provider store={store}>
            <ConnectedRouter history={history}>
              <Header />
              <Routes />
            </ConnectedRouter>
          </Provider>
        </SnackbarProvider>
      </ThemeProvider>
    </Provider>
  )
}

export default hot(Root)
