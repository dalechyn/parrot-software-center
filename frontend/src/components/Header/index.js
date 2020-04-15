import React, { useState } from 'react'
import { withStyles, AppBar, Box, Toolbar, Typography, Divider } from '@material-ui/core'
import Alert from '@material-ui/lab/Alert'

import SearchBar from '../SearchBar'

const styles = {
  leftContent: {
    flexGrow: 1
  }
}

const Header = ({ classes }) => {
  const [errorPackage, setSearchError] = useState('')
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
      {errorPackage && <Alert severity='error'>Can`t find package {errorPackage}</Alert>}
    </>
  )
}

export default withStyles(styles)(Header)
