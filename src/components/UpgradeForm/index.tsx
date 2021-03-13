import { Button, CircularProgress, Grid, makeStyles, Paper } from '@material-ui/core'
import { unwrapResult } from '@reduxjs/toolkit'
import React, { useEffect, useState } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { CheckCircleOutline as SuccessIcon } from '@material-ui/icons'
import { push } from 'connected-react-router'
import { withRouter } from 'react-router'
import { RouteComponentProps } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AptActions, QueueActions } from '../../actions'
import UpdateList from './UpdateList'
import { QueueNodeMeta } from '../../types/queue'

const useStyles = makeStyles(theme => ({
  padded: {
    padding: theme.spacing(2)
  }
}))

const mapStateToProps = ({ queue: { packages } }: RootState) => ({
  packages
})

const mapDispatchToProps = {
  upgrade: QueueActions.upgrade,
  checkUpdates: AptActions.checkUpdates,
  push
}

const connector = connect(mapStateToProps, mapDispatchToProps)

type UpgradeFormProps = ConnectedProps<typeof connector> & RouteComponentProps

const UpgradeForm = ({ checkUpdates, upgrade, push, packages }: UpgradeFormProps) => {
  const classes = useStyles()
  const [loading, setLoading] = useState(true)
  const [updates, setUpdates] = useState(Array<QueueNodeMeta>())

  const { t } = useTranslation()

  useEffect(() => {
    let active = true
    const f = async () => {
      try {
        const data = unwrapResult(await checkUpdates()).filter(({ name, source, version }) =>
          packages.every(
            ({ name: packageName, source: packageSource, version: packageVersion }) =>
              packageName !== name && packageSource !== source && packageVersion !== version
          )
        )
        if (!active) return
        setUpdates(data)
      } catch (e) {
        setUpdates([])
      }
      setLoading(false)
    }
    f()
    return () => {
      active = false
    }
  }, [checkUpdates, packages])
  return (
    <Grid container direction="column" alignItems="center" className={classes.padded}>
      {loading ? (
        <CircularProgress />
      ) : (
        <>
          <Grid item xs>
            <h2 style={{ textAlign: 'center' }}>
              {updates.length !== 0
                ? `${updates.length} ${t('update')}`
                : packages.length === 0
                ? `${t('systemUpdated')}`
                : `${packages.length} ${t('upgrade')}`}
            </h2>
          </Grid>
          {packages.length === 0 ||
          updates.filter(update =>
            packages.every(node => node.name !== update.name && node.source !== update.source)
          ) ? (
            <>
              {updates.length !== 0 && (
                <Paper style={{ padding: '1rem', width: '100%' }} elevation={10}>
                  <UpdateList updates={updates} />
                </Paper>
              )}
              <Button
                size="large"
                variant="contained"
                color="primary"
                style={{ marginTop: '1rem' }}
                onClick={() => {
                  updates
                    .filter(update =>
                      packages.every(
                        node => node.name !== update.name && node.source !== update.source
                      )
                    )
                    .forEach(name => upgrade(name))
                  push('/queue')
                }}
              >
                {t('upgradeBtn')}
              </Button>
            </>
          ) : (
            <SuccessIcon color="primary" fontSize="large" />
          )}
        </>
      )}
    </Grid>
  )
}

export default connector(withRouter(UpgradeForm))
