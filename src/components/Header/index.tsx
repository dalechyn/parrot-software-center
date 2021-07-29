import React, { useEffect } from 'react'

import { connect, ConnectedProps } from 'react-redux'

import { AppBar, Button, Toolbar, Collapse } from '@material-ui/core'
import Alert from '@material-ui/lab/Alert'
import { SnackbarKey, useSnackbar } from 'notistack'
import { unwrapResult } from '@reduxjs/toolkit'
import useConstant from 'use-constant'
import { useTranslation } from 'react-i18next'
import { ipcRenderer } from 'electron'
import SearchBar from '../SearchBar'
import { AlertActions, AptActions, AuthActions } from '../../actions'

const mapStateToProps = ({
  alert,
  auth: { accessToken, role },
  router: {
    location: { pathname }
  },
  queue: { packages }
}: RootState) => ({ alert, token: accessToken, role, pathname, queueLength: packages.length })

const mapDispatchToProps = {
  clear: AlertActions.clear,
  setUserInfo: AuthActions.setUserInfo,
  checkUpdates: AptActions.checkUpdates
}

const connector = connect(mapStateToProps, mapDispatchToProps)

type HeaderProps = ConnectedProps<typeof connector>

const Header = ({ alert, clear, checkUpdates, setUserInfo, pathname }: HeaderProps) => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()

  const { t } = useTranslation()

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
    let active = true
    const f = async () => {
      const result = await checkUpdates()

      if (!active) return
      enqueueSnackbar(`${unwrapResult(result).length} ${t('pkgAvailable')}`, {
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'right'
        },
        action
      })
    }
    f()

    ipcRenderer.on('AUTH', (_event, status) => {
      if (status === 'logout') {
        setUserInfo({ login: '', accessToken: '', refreshToken: '', role: '' })
      }
    })

    return () => {
      active = false
    }
  }, [])
  return (
    <>
      <AppBar color="transparent" position="static" elevation={0}>
        <Toolbar style={{ justifyContent: 'flex-end' }}>
          <Collapse in={!pathname.includes('search')}>
            <SearchBar />
          </Collapse>
        </Toolbar>
      </AppBar>
      {alert && (
        <Alert severity="error" onClose={() => clear()}>
          {alert}
        </Alert>
      )}
    </>
  )
}

export default connector(Header)
