import React, { useMemo } from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import {
  ThemeProvider,
  CssBaseline,
  createMuiTheme,
  useMediaQuery
} from '@material-ui/core'
import Header from './components/Header'
import Home from './pages/Home'

const App = () => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')

  const theme = useMemo(
    () =>
      createMuiTheme({
        palette: {
          type: prefersDarkMode ? 'dark' : 'light'
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
        </Switch>
      </Router>
    </ThemeProvider>
  )
}

export default App
