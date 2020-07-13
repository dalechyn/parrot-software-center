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

const useStyles = makeStyles(theme => ({
  padded: {
    padding: theme.spacing(2)
  },
  margin: {
    marginTop: theme.spacing(2)
  }
}))

const mapStateToProps = ({ settings: { APIUrl }, queue: { upgradeProgress } }: RootState) => ({
  APIUrl,
  upgradeProgress
})

const mapDispatchToProps = {
  upgrade: QueueActions.upgrade,
  checkUpdates: AptActions.checkUpdates,
  searchPreviews: AptActions.searchPreviews,
  setAlert: AlertActions.set
}

const connector = connect(mapStateToProps, mapDispatchToProps)

type UpgradeFormProps = ConnectedProps<typeof connector>

const UpgradeForm = ({
  checkUpdates,
  searchPreviews,
  setAlert,
  APIUrl,
  upgrade
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
              {previews
                ? `${previews.length} updates available! Upgrade now!`
                : 'Your system is up to date'}
            </h2>
          </Grid>
          {previews ? (
            <>
              <Paper elevation={10}>
                <List style={{ maxHeight: 600, overflow: 'auto' }}>
                  {previews.map(({ name, description }, i) => (
                    <ListItem key={i}>
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

export default connector(UpgradeForm)
