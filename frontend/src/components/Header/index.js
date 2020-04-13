import React from 'react'
import { withStyles, AppBar, Box, Toolbar, Typography, Divider } from '@material-ui/core'

import SearchBar from '../SearchBar'

const styles = {
  leftContent: {
    flexGrow: 1
  }
}

const Header = ({ classes }) => {
  return (
    <AppBar position='static'>
      <Toolbar>
        {/* This should be replaced by logo */}
        <Box className={classes.leftContent}>
          <Typography variant='h6'>ParrotOS Software Center</Typography>
        </Box>
        <SearchBar />
      </Toolbar>
      <Divider />
    </AppBar>
  )
}

export default withStyles(styles)(Header)
