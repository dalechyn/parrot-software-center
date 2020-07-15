import {
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

const mapStateToProps = ({ queue: { packages }, settings: { APIUrl } }: RootState) => ({
  APIUrl,
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
  APIUrl,
  upgrade,
  push,
  packages
}: UpgradeFormProps) => {
  const classes = useStyles()
  const [loading, setLoading] = useState(false)
  const [previews, setPreviews] = useState(Array<Preview>())

  useEffect(() => {
    const f = async () => {
      try {
        setLoading(true)
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
                    .filter(({ name }) =>
                      packages.every(({ name: packageName }) => packageName !== name)
                    )
                    .map(({ name, description }) => (
                      <ListItem key={name}>
                        <PackagePreview
                          name={name}
                          description={description}
                          imageUrl={`${APIUrl}/assets/packages/${name}.png`}
                        />
                      </ListItem>
                    ))}
                </List>
              </Paper>
              <Button
                size="large"
                variant="contained"
                style={{ marginTop: '1rem' }}
                onClick={() => {
                  previews.map(({ name }) => upgrade(name))
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
