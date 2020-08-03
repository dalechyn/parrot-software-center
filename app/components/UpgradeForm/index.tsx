import {
  Box,
  Button,
  CircularProgress,
  Grid,
  List,
  ListItem,
  makeStyles,
  Paper
} from '@material-ui/core'
import { unwrapResult } from '@reduxjs/toolkit'
import React, { useEffect, useState } from 'react'
import { AlertActions, AptActions, QueueActions } from '../../actions'
import { connect, ConnectedProps } from 'react-redux'
import { CheckCircleOutline as SuccessIcon } from '@material-ui/icons'
import PackagePreview from '../PackagePreview'
import { Preview } from '../../actions/apt'
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
  searchPreviews: AptActions.searchPreviews,
  setAlert: AlertActions.set,
  push
}

const connector = connect(mapStateToProps, mapDispatchToProps)

type UpgradeFormProps = ConnectedProps<typeof connector> & RouteComponentProps

const UpgradeForm = ({
  checkUpdates,
  searchPreviews,
  upgrade,
  push,
  packages
}: UpgradeFormProps) => {
  const classes = useStyles()
  const [loading, setLoading] = useState(true)
  const [previews, setPreviews] = useState(Array<Preview>())

  const [showRest, setShowRest] = useState(false)

  useEffect(() => {
    const f = async () => {
      try {
        const updates = unwrapResult(await checkUpdates())
        setPreviews(
          await Promise.all(updates.map(async name => unwrapResult(await searchPreviews(name))[0]))
        )
      } catch (e) {
        setPreviews([])
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
              {previews.length !== 0
                ? `${previews.length} updates available! Upgrade now!`
                : 'Your system is up to date'}
            </h2>
          </Grid>
          {previews.length !== 0 ? (
            <>
              <Paper elevation={10}>
                <List style={{ maxHeight: 600, overflow: 'auto' }}>
                  {previews
                    .slice(0, 3)
                    .filter(({ name }) =>
                      packages.every(({ name: packageName }) => packageName !== name)
                    )
                    .map(({ name, description }) => (
                      <ListItem key={name}>
                        <PackagePreview name={name} description={description} />
                      </ListItem>
                    ))}
                  {showRest &&
                    previews
                      .slice(3)
                      .filter(({ name }) =>
                        packages.every(({ name: packageName }) => packageName !== name)
                      )
                      .map(({ name, description }) => (
                        <ListItem key={name}>
                          <PackagePreview name={name} description={description} />
                        </ListItem>
                      ))}
                </List>
              </Paper>
              <Box display="flex" marginTop={3}>
                <Button
                  size="large"
                  variant="contained"
                  onClick={() => setShowRest(!showRest)}
                  style={{ marginRight: '1rem' }}
                >
                  {showRest ? 'Minimize' : 'Expand'}
                </Button>
                <Button
                  size="large"
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    previews.map(({ name }) => upgrade(name))
                    push('/queue')
                  }}
                >
                  Upgrade
                </Button>
              </Box>
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
