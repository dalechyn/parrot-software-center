import React, { useMemo } from 'react'
import { ConnectedRouter } from 'connected-react-router'
import { hot } from 'react-hot-loader/root'
import history from '../../store/history'
import Routes from './Routes'
import { Header } from '../../components'
import { createMuiTheme, CssBaseline, ThemeProvider } from '@material-ui/core'
import { SnackbarProvider } from 'notistack'
import { connect, ConnectedProps } from 'react-redux'
import { blue } from '@material-ui/core/colors'

const mapStateToProps = ({ settings: { darkTheme } }: RootState) => ({ darkTheme })

const connector = connect(mapStateToProps)

type RootProps = ConnectedProps<typeof connector>

const Root = ({ darkTheme }: RootProps) => {
  const theme = useMemo(
    () =>
      createMuiTheme({
        palette: {
          primary: blue,
          secondary: {
            main: blue[50]
          },

          type: darkTheme ? 'dark' : 'light'
        },
        typography: {
          fontFamily: 'Hack'
        }
      }),
    [darkTheme]
  )
  return (
    <SnackbarProvider maxSnack={3}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ConnectedRouter history={history}>
          <Header />
          <Routes />
        </ConnectedRouter>
      </ThemeProvider>
    </SnackbarProvider>
  )
}

export default connector(hot(Root))
