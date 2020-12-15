import React, { useMemo } from 'react'
import { ConnectedRouter } from 'connected-react-router'
import { hot } from 'react-hot-loader/root'
import history from '../../store/history'
import Routes from './Routes'
import { Header } from '../../components'
import {
  CircularProgress,
  createMuiTheme,
  CssBaseline,
  ThemeProvider,
  Typography
} from '@material-ui/core'
import { SnackbarProvider } from 'notistack'
import { connect, ConnectedProps } from 'react-redux'
import { blue } from '@material-ui/core/colors'
import { useTranslation } from 'react-i18next'

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
            main: blue[300]
          },

          type: darkTheme ? 'dark' : 'light'
        },
        typography: {
          fontFamily: 'Hack'
        }
      }),
    [darkTheme]
  )

  const { ready } = useTranslation()
  return (
    <ThemeProvider theme={theme}>
      <SnackbarProvider maxSnack={3}>
        <CssBaseline />
        <ConnectedRouter history={history}>
          {ready ? (
            <>
              <Header />
              <Routes />
            </>
          ) : (
            <section
              style={{
                display: 'flex',
                height: '100vh',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <CircularProgress />
                <Typography variant="h5" style={{ marginLeft: 10 }}>
                  {' '}
                  Loading localization files
                </Typography>
              </div>
            </section>
          )}
        </ConnectedRouter>
      </SnackbarProvider>
    </ThemeProvider>
  )
}

export default connector(hot(Root))
