import React, { useMemo } from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import {
  ThemeProvider,
  CssBaseline,
  createMuiTheme,
  useMediaQuery
} from '@material-ui/core'
import { blue } from '@material-ui/core/colors'

import { Home, SearchResults, PackageInfo } from './pages'

import { Header } from './components'

const App = () => {
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

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Header />
        <Switch>
          <Route exact path='/'>
            <Home />
          </Route>
          <Route exact path='/store'>
            Store
          </Route>
          <Route exact path='/about'>
            About
          </Route>
          <Route exact path='/search'>
            <SearchResults />
          </Route>
          <Route exact path='/package'>
            <PackageInfo />
          </Route>
        </Switch>
      </Router>
    </ThemeProvider>
  )
}

export default App
