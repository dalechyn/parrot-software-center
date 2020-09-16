import { Button, CircularProgress, Grid, Link, makeStyles, Paper } from '@material-ui/core'
import { unwrapResult } from '@reduxjs/toolkit'
import React, { useEffect, useState } from 'react'
import { AptActions, QueueActions } from '../../actions'
import { connect, ConnectedProps } from 'react-redux'
import { CheckCircleOutline as SuccessIcon } from '@material-ui/icons'
import { push } from 'connected-react-router'
import { withRouter } from 'react-router'
import { RouteComponentProps } from 'react-router-dom'
import { QueueNodeMeta } from '../../actions/queue'

const useStyles = makeStyles(theme => ({
  padded: {
    padding: theme.spacing(2)
  },
  margin: {
    marginTop: theme.spacing(2)
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

  useEffect(() => {
    const f = async () => {
      try {
        setUpdates(
          unwrapResult(await checkUpdates()).filter(({ name, source, version }) =>
            packages.every(
              ({ name: packageName, source: packageSource, version: packageVersion }) =>
                packageName !== name && packageSource !== source && packageVersion !== version
            )
          )
        )
      } catch (e) {
        setUpdates([])
      }
      setLoading(false)
    }
    f()
  }, [])
  return (
    <Grid
      container
      direction="column"
      alignItems="center"
      component={Paper}
      className={classes.padded}
    >
      {loading ? (
        <CircularProgress />
      ) : (
        <>
          <Grid item xs>
            <h2>
              {updates.length !== 0
                ? `${updates.length} updates available! Upgrade now!`
                : packages.length === 0
                ? 'Your system is up to date'
                : `${packages.length} are waiting for upgrade! Upgrade now!`}
            </h2>
          </Grid>
          {packages.length === 0 ||
          updates.filter(update =>
            packages.every(node => node.name !== update.name && node.source !== update.source)
          ) ? (
            <>
              {updates.length !== 0 && (
                <Paper style={{ padding: '1rem' }} elevation={10}>
                  {updates.map(({ name: upgradableName }, i, dependsSplitted) => {
                    return (
                      <div
                        style={{ display: 'inline-block', whiteSpace: 'pre' }}
                        key={`${name}-upgradable-link-${upgradableName}`}
                      >
                        <Link
                          component="button"
                          variant="body1"
                          onClick={() => push(`/package/${upgradableName}`)}
                        >
                          {upgradableName}
                        </Link>
                        {i !== dependsSplitted.length - 1 && ', '}
                      </div>
                    )
                  })}
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
                Upgrade
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
