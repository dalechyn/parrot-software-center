import React, { useEffect, useState } from 'react'
import { Button, Collapse, Grid, makeStyles, Paper } from '@material-ui/core'
import { connect, ConnectedProps } from 'react-redux'
import { AptActions, AlertActions } from '../../actions'
import { unwrapResult } from '@reduxjs/toolkit'
import Terminal from '../../components/Terminal'

const useStyles = makeStyles(theme => ({
  padded: {
    padding: theme.spacing(2)
  },
  margin: {
    marginTop: theme.spacing(2)
  }
}))

const mapDispatchToProps = {
  checkUpdates: AptActions.checkUpdates,
  upgrade: AptActions.upgrade,
  setAlert: AlertActions.set
}
const connector = connect(null, mapDispatchToProps)
type HomeProps = ConnectedProps<typeof connector>

const Home = ({ checkUpdates, setAlert, upgrade }: HomeProps) => {
  const classes = useStyles()
  const [upgrading, setUpgrading] = useState(false)
  const [updates, setUpdates] = useState(0)
  useEffect(() => {
    const f = async () => {
      try {
        setUpdates(unwrapResult(await checkUpdates()))
      } catch (e) {
        setAlert(e)
      }
    }
    f()
  }, [])
  return (
    <Grid container direction="column" alignItems="center" className={classes.padded}>
      {updates !== 0 && (
        <Grid
          container
          direction="column"
          alignItems="center"
          component={Paper}
          className={classes.padded}
        >
          <Grid item xs>
            <h2>{updates} updates available! Upgrade now!</h2>
          </Grid>
          <Button size="large" variant="contained" onClick={() => setUpgrading(true)}>
            Upgrade
          </Button>
          <Grid className={classes.margin} item xs={6}>
            <Collapse in={upgrading}>
              {upgrading && (
                <Terminal
                  serveStream={async (onValue: (chunk: string) => void, onFinish: () => void) =>
                    unwrapResult(await upgrade({ onValue, onFinish }))
                  }
                  onClose={() => setUpgrading(false)}
                  initialLine={`# apt-get update && apt-get -y dist-upgrade`}
                  width={300}
                  height={300}
                />
              )}
            </Collapse>
          </Grid>
        </Grid>
      )}
    </Grid>
  )
}

export default connector(Home)
