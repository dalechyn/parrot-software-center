import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import {
  AppBar,
  Box,
  Button,
  Drawer,
  Divider,
  IconButton,
  Toolbar,
  Typography,
  makeStyles
} from '@material-ui/core'
import {
  Menu as MenuIcon,
  ChevronLeft as DrawerCloseIcon,
  ImportContacts as FeedIcon,
  Queue as QueueIcon
} from '@material-ui/icons'
import Alert from '@material-ui/lab/Alert'
import SearchBar from '../SearchBar'

const useStyles = makeStyles(theme => ({
  drawer: { width: 250 },
  leftContent: {
    flexGrow: 1
  },
  menuButton: {
    marginRight: theme.spacing(2)
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end'
  }
}))

const Header = ({ alert }) => {
  const classes = useStyles()
  const [drawerOpen, setDrawer] = useState(false)

  const handleDrawerOpen = () => setDrawer(true)
  const handleDrawerClose = () => setDrawer(false)
  return (
    <>
      <AppBar color='primary' position='static'>
        <Toolbar>
          <IconButton
            color='inherit'
            aria-label='open drawer'
            onClick={handleDrawerOpen}
            edge='start'
            className={classes.menuButton}
          >
            <MenuIcon />
          </IconButton>
          {/* This should be replaced by logo */}
          <Box className={classes.leftContent}>
            <Typography variant='h6'>ParrotOS Software Center</Typography>
          </Box>
          <SearchBar />
        </Toolbar>
        <Divider />
      </AppBar>
      <Drawer classes={{ paper: classes.drawer }} open={drawerOpen}>
        <div className={classes.drawerHeader}>
          <Button startIcon={<DrawerCloseIcon />} fullWidth onClick={handleDrawerClose}>
            Hide
          </Button>
        </div>
        <Divider />
        <Button startIcon={<FeedIcon />} size='large' component={Link} to={'/feed'}>
          Feed
        </Button>
        <Button startIcon={<QueueIcon />} size='large' component={Link} to={'/queue'}>
          Queue
        </Button>
      </Drawer>
      {/* if the error came from GoLang, it is not a JavaScript error object and doesn`t
      have message prop. I will open an issue on WebView about that */}
      {alert && <Alert severity='error'>{alert}</Alert>}
    </>
  )
}

const mapStateToProps = ({ alert }) => ({ alert })

if (process.env.node_env === 'development') {
  Header.propTypes = {
    classes: PropTypes.object,
    alert: PropTypes.object
  }
}

export default connect(mapStateToProps)(Header)
