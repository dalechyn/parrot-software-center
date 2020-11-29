import React, { useEffect, useState } from 'react'

import { connect, ConnectedProps } from 'react-redux'
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
  makeStyles,
  Collapse
} from '@material-ui/core'
import {
  Menu as MenuIcon,
  ChevronLeft as DrawerCloseIcon,
  ImportContacts as FeedIcon,
  Queue as QueueIcon,
  Explore as MapIcon,
  VpnKey as LoginIcon,
  Settings as SettingsIcon,
  Assessment as AssessmentIcon
} from '@material-ui/icons'
import Alert from '@material-ui/lab/Alert'
import SearchBar from '../SearchBar'
import { AlertActions, AptActions, AuthActions } from '../../actions'
import { SnackbarKey, useSnackbar } from 'notistack'
import { unwrapResult } from '@reduxjs/toolkit'
import AuthDialog from '../AuthDialog'
import SettingsDialog from '../SettingsDialog'
import useConstant from 'use-constant'

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

const mapStateToProps = ({
  alert,
  auth: { token, role },
  router: {
    location: { pathname }
  }
}: RootState) => ({ alert, token, role, pathname })

const mapDispatchToProps = {
  clear: AlertActions.clear,
  setUserInfo: AuthActions.setUserInfo,
  checkUpdates: AptActions.checkUpdates
}

const connector = connect(mapStateToProps, mapDispatchToProps)

type HeaderProps = ConnectedProps<typeof connector>

const Header = ({
  alert,
  clear,
  checkUpdates,
  token,
  role,
  setUserInfo,
  pathname
}: HeaderProps) => {
  const classes = useStyles()
  const [drawerOpen, setDrawer] = useState(false)
  const [authOpened, setAuthOpened] = useState(false)
  const [settingsOpened, setSettingsOpened] = useState(false)
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()

  const action = useConstant(
    () =>
      function Action(key: SnackbarKey) {
        return (
          <Button
            color="inherit"
            onClick={() => {
              closeSnackbar(key)
            }}
          >
            OK
          </Button>
        )
      }
  )

  useEffect(() => {
    const f = async () => {
      const result = await checkUpdates()

      enqueueSnackbar(`${unwrapResult(result).length} packages are available for update`, {
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'right'
        },
        action
      })
    }
    f()
  }, [])
  const handleDrawerOpen = () => setDrawer(true)
  const handleDrawerClose = () => setDrawer(false)
  return (
    <>
      <AppBar color="primary" position="static">
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            className={classes.menuButton}
          >
            <MenuIcon />
          </IconButton>
          {/* This should be replaced by logo */}
          <Box className={classes.leftContent}>
            <Typography variant="h6">ParrotOS Software Center</Typography>
          </Box>
          <Collapse in={!pathname.includes('search')}>
            <SearchBar />
          </Collapse>
        </Toolbar>
        <Divider />
      </AppBar>
      <Drawer classes={{ paper: classes.drawer }} open={drawerOpen} onClose={handleDrawerClose}>
        <div className={classes.drawerHeader}>
          <Button startIcon={<DrawerCloseIcon />} fullWidth onClick={handleDrawerClose}>
            Hide
          </Button>
        </div>
        <Divider />
        <Button startIcon={<FeedIcon />} size="large" component={Link} to={'/'}>
          Home
        </Button>
        <Button startIcon={<QueueIcon />} size="large" component={Link} to={'/queue'}>
          Queue
        </Button>
        {role === 'moderator' && (
          <Button startIcon={<AssessmentIcon />} size="large" component={Link} to={'/reports'}>
            Reports
          </Button>
        )}
        <Button startIcon={<MapIcon />} size="large" component={Link} to={'/mirrors'}>
          Mirrors
        </Button>
        <Button startIcon={<SettingsIcon />} onClick={() => setSettingsOpened(true)} size="large">
          Settings
        </Button>
        <Divider />
        {token ? (
          <Button
            startIcon={<LoginIcon />}
            onClick={() => setUserInfo({ login: '', token: '', role: '' })}
            size="large"
          >
            Log out
          </Button>
        ) : (
          <Button startIcon={<LoginIcon />} onClick={() => setAuthOpened(true)} size="large">
            Log in
          </Button>
        )}
        {authOpened && <AuthDialog onClose={() => setAuthOpened(false)} />}
        {settingsOpened && <SettingsDialog onClose={() => setSettingsOpened(false)} />}
      </Drawer>
      {alert && (
        <Alert severity="error" onClose={() => clear()}>
          {alert}
        </Alert>
      )}
    </>
  )
}

export default connector(Header)
