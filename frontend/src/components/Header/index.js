import React, { useState } from 'react'
import PropTypes from 'prop-types'

import { withStyles, AppBar, Box, Toolbar, Typography, Divider } from '@material-ui/core'
import Alert from '@material-ui/lab/Alert'

import SearchBar from '../SearchBar'

const styles = {
  leftContent: {
    flexGrow: 1
  }
}

const Header = ({ classes }) => {
  const [searchError, setSearchError] = useState('')
  return (
    <>
      <AppBar position='static'>
        <Toolbar>
          {/* This should be replaced by logo */}
          <Box className={classes.leftContent}>
            <Typography variant='h6'>ParrotOS Software Center</Typography>
          </Box>
          <SearchBar setError={setSearchError} />
        </Toolbar>
        <Divider />
      </AppBar>
      {/* if the error came from GoLang, it is not a JavaScript error object and doesn`t
      have message prop. I will open an issue on WebView about that */}
      {searchError && (
        <Alert severity='error'>
          {searchError.message ? searchError.message : searchError}
        </Alert>
      )}
    </>
  )
}

if (process.env.node_env === 'development') {
  Header.propTypes = {
    classes: PropTypes.object
  }
}

export default withStyles(styles)(Header)
