import { Button, CircularProgress, Collapse, Grid, makeStyles, Paper } from '@material-ui/core'
import Terminal from '../Terminal'
import { unwrapResult } from '@reduxjs/toolkit'
import React, { useEffect, useState } from 'react'
import { AlertActions, AptActions } from '../../actions'
import { connect, ConnectedProps } from 'react-redux'
import { CheckCircleOutline as SuccessIcon } from '@material-ui/icons'

const useStyles = makeStyles(theme => ({
  padded: {
    padding: theme.spacing(2)
  },
  margin: {
    marginTop: theme.spacing(2)
  }
}))

const mapDispatchToProps = {
  upgrade: AptActions.upgrade,
  checkUpdates: AptActions.checkUpdates,
  setAlert: AlertActions.set
}

const connector = connect(null, mapDispatchToProps)

type UpgradeFormProps = ConnectedProps<typeof connector>

const UpgradeForm = ({ checkUpdates, upgrade, setAlert }: UpgradeFormProps) => {
  const classes = useStyles()
  const [loading, setLoading] = useState(false)
  const [upgrading, setUpgrading] = useState(false)
  const [updates, setUpdates] = useState(0)
  useEffect(() => {
    const f = async () => {
      try {
        setLoading(true)
        setUpdates(unwrapResult(await checkUpdates()))
      } catch (e) {
        setAlert(e)
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
              {updates ? `${updates} updates available! Upgrade now!` : 'Your system is up to date'}{' '}
            </h2>
          </Grid>
          {updates ? (
            <Button size="large" variant="contained" onClick={() => setUpgrading(true)}>
              Upgrade
            </Button>
          ) : (
            <SuccessIcon color="primary" fontSize="large" />
          )}
        </>
      )}

      {upgrading && (
        <Grid className={classes.margin} item xs={6}>
          <Collapse in={upgrading}>
            <Terminal
              serveStream={async (onValue: (chunk: string) => void, onFinish: () => void) =>
                unwrapResult(await upgrade({ onValue, onFinish }))
              }
              onClose={() => setUpgrading(false)}
              initialLine={`# apt-get update && apt-get -y dist-upgrade`}
              width={500}
              height={500}
            />
          </Collapse>
        </Grid>
      )}
    </Grid>
  )
}

export default connector(UpgradeForm)
