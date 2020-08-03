import { Button, CircularProgress, Grid, Link, makeStyles, Paper } from '@material-ui/core'
import { unwrapResult } from '@reduxjs/toolkit'
import React, { useEffect, useState } from 'react'
import { AlertActions, AptActions, QueueActions } from '../../actions'
import { connect, ConnectedProps } from 'react-redux'
import { CheckCircleOutline as SuccessIcon } from '@material-ui/icons'
import { push } from 'connected-react-router'
import { withRouter } from 'react-router'
import { RouteComponentProps } from 'react-router-dom'

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
  setAlert: AlertActions.set,
  push
}

const connector = connect(mapStateToProps, mapDispatchToProps)

type UpgradeFormProps = ConnectedProps<typeof connector> & RouteComponentProps

const UpgradeForm = ({ checkUpdates, upgrade, push, packages }: UpgradeFormProps) => {
  const classes = useStyles()
  const [loading, setLoading] = useState(true)
  const [updates, setUpdates] = useState(Array<string>())

  useEffect(() => {
    const f = async () => {
      try {
        setUpdates(unwrapResult(await checkUpdates()))
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
                : 'Your system is up to date'}
            </h2>
          </Grid>
          {updates.length !== 0 ? (
            <>
              <Paper style={{ padding: '1rem' }} elevation={10}>
                {updates
                  .filter(name => packages.every(({ name: packageName }) => packageName !== name))
                  .map((upgradableName, i, dependsSplitted) => {
                    return (
                      <>
                        <Link
                          component="button"
                          key={`${name}-upgradable-link-${upgradableName}`}
                          variant="body1"
                          onClick={() => push(`/package/${upgradableName}`)}
                        >
                          {upgradableName}
                        </Link>
                        {i !== dependsSplitted.length - 1 && ', '}
                      </>
                    )
                  })}
              </Paper>
              <Button
                size="large"
                variant="contained"
                color="primary"
                style={{ marginTop: '1rem' }}
                onClick={() => {
                  updates.map(name => upgrade(name))
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
