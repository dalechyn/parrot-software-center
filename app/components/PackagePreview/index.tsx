import React, { useEffect, useState } from 'react'
import classnames from 'classnames'

import { connect, ConnectedProps } from 'react-redux'
import { Img } from 'react-image'
import { push } from 'connected-react-router'
import { useSnackbar } from 'notistack'

import {
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  Chip,
  CircularProgress,
  makeStyles,
  Paper,
  Typography
} from '@material-ui/core'
import { amber, grey, orange, red } from '@material-ui/core/colors'
import dummyPackageImg from '../../assets/package.png'
import { AptActions, QueueActions } from '../../actions'
import { unwrapResult } from '@reduxjs/toolkit'
import { QueueNode } from '../../containers/Queue'
import { CVEInfoType } from '../PackagePreviewList'
import { INSTALL, UPGRADE } from '../../reducers/queue'
import { Rating } from '@material-ui/lab'

const useStyles = makeStyles(theme => ({
  root: {
    width: '80vw'
  },
  description: {
    whiteSpace: 'pre-wrap',
    paddingTop: theme.spacing(2)
  },
  media: {
    height: 40,
    width: 40
  },
  header: {
    padding: theme.spacing(2),
    display: 'flex',
    flexFlow: 'column'
  },
  nameHolder: {
    display: 'flex',
    alignItems: 'center'
  },
  cve: {
    display: 'grid',
    gridAutoFlow: 'column',
    alignItems: 'center',
    gridGap: theme.spacing(1),
    paddingTop: theme.spacing(1),
    marginLeft: 'auto'
  },
  buttonsHolder: {
    justifyContent: 'flex-end'
  },
  cveCritical: {
    background: red[500]
  },
  cveHigh: {
    background: orange[500]
  },
  cveMedium: {
    background: amber[500]
  },
  name: {
    paddingLeft: theme.spacing(1)
  },
  chipText: {
    color: grey[900]
  },
  install: {
    color: '#2196f3',
    borderColor: '#2196f3'
  },
  uninstall: {
    color: '#f44336',
    borderColor: '#f44336'
  },
  upgrade: {
    color: '#4caf50',
    borderColor: '#4caf50'
  }
}))

const mapStateToProps = ({ queue: { packages, isBusy }, settings: { APIUrl } }: RootState) => ({
  packages,
  isBusy,
  APIUrl
})

const mapDispatchToProps = {
  push,
  install: QueueActions.install,
  uninstall: QueueActions.uninstall,
  upgrade: QueueActions.upgrade,
  dontUpgrade: QueueActions.dontUpgrade,
  status: AptActions.status,
  checkUpgradable: AptActions.checkUpgradable,
  getRatings: AptActions.getRatings
}

const connector = connect(mapStateToProps, mapDispatchToProps)

type PackagePreviewProps = ConnectedProps<typeof connector> & {
  name: string
  description: string
  cveInfo?: CVEInfoType
}

const PackagePreview = ({
  name,
  description,
  push,
  install,
  uninstall,
  upgrade,
  dontUpgrade,
  packages,
  cveInfo,
  status,
  checkUpgradable,
  isBusy,
  getRatings,
  APIUrl
}: PackagePreviewProps) => {
  const classes = useStyles()

  const [rating, setRating] = useState(-1)
  const [loading, setLoading] = useState(true)
  const [installedOrQueried, setInstalled] = useState(false)
  const [upgradable, setUpgradable] = useState(false)
  const [queuedUpgrade, setQueuedUpgrade] = useState(upgradable)
  const [isQueued, setQueued] = useState(false)
  const { enqueueSnackbar } = useSnackbar()

  useEffect(() => {
    const foundPackage = packages.find((pkg: QueueNode) => name === pkg.name)
    if (foundPackage) {
      setQueued(true)
      if (foundPackage.flag === UPGRADE) {
        setUpgradable(true)
        setQueuedUpgrade(true)
      } else if (foundPackage.flag === INSTALL) {
        setInstalled(true)
      }
      setLoading(false)
    } else
      (async () => {
        const installed = unwrapResult(await status(name))
        setInstalled(installed)
        if (installed) setUpgradable(unwrapResult(await checkUpgradable(name)))

        try {
          const res = unwrapResult(await getRatings(name))
          setRating(res)
        } catch {
          setRating(0)
        }
        setLoading(false)
      })()
  }, [])
  return (
    <Card className={classes.root}>
      <CardActionArea onClick={() => push(`/package/${name}`)}>
        <CardContent>
          <Paper className={classes.header} elevation={10}>
            <div className={classes.nameHolder}>
              <Img
                className={classes.media}
                src={`${APIUrl}/assets/packages/${name}`}
                unloader={
                  <img className={classes.media} src={dummyPackageImg} alt={'No Package Found'} />
                }
              />
              <Typography className={classes.name} variant="h5">
                {name}
              </Typography>
              {rating === -1 ? (
                <CircularProgress style={{ marginLeft: 'auto' }} />
              ) : (
                <Rating readOnly value={rating} style={{ marginLeft: 'auto' }} />
              )}
            </div>
            {cveInfo && (
              <div className={classes.cve}>
                {(cveInfo.critical != 0 ||
                  cveInfo.high != 0 ||
                  cveInfo.medium != 0 ||
                  cveInfo.low != 0) && (
                  <>
                    <Chip label={'This month CVEs:'} />
                    {cveInfo.critical != 0 && (
                      <Chip
                        className={classnames(classes.cveCritical, classes.chipText)}
                        label={`Critical: ${cveInfo.critical}`}
                      />
                    )}
                    {cveInfo.high != 0 && (
                      <Chip
                        className={classnames(classes.cveHigh, classes.chipText)}
                        label={`High: ${cveInfo.high}`}
                      />
                    )}
                    {cveInfo.medium != 0 && (
                      <Chip
                        className={classnames(classes.cveMedium, classes.chipText)}
                        label={`Medium: ${cveInfo.medium}`}
                      />
                    )}
                    {cveInfo.low != 0 && <Chip label={`Low: ${cveInfo.low}`} />}
                  </>
                )}
              </div>
            )}
          </Paper>
          <Typography
            className={classes.description}
            variant="body1"
            color="textSecondary"
            component="p"
            noWrap
          >
            {description}
          </Typography>
        </CardContent>
      </CardActionArea>
      <CardActions className={classes.buttonsHolder}>
        {loading && <CircularProgress disableShrink />}
        {upgradable &&
          (queuedUpgrade ? (
            <Button
              classes={{ outlined: classes.uninstall }}
              disabled={isQueued && isBusy}
              onClick={() => {
                enqueueSnackbar(`Package ${name} dequeued`, {
                  variant: 'error'
                })
                dontUpgrade(name)
                setQueuedUpgrade(false)
              }}
              variant="outlined"
              size="medium"
            >
              Cancel Upgrade
            </Button>
          ) : (
            <Button
              classes={{ outlined: classes.upgrade }}
              disabled={isQueued && isBusy}
              onClick={() => {
                enqueueSnackbar(`Package ${name} queued for upgrade`, {
                  variant: 'success'
                })
                upgrade(name)
                setQueuedUpgrade(true)
              }}
              variant="outlined"
              size="medium"
            >
              Upgrade
            </Button>
          ))}

        {!loading &&
          (installedOrQueried ? (
            <Button
              classes={{ outlined: classes.uninstall }}
              disabled={isQueued && isBusy}
              onClick={() => {
                enqueueSnackbar(
                  packages.find((el: QueueNode) => el.name === name)
                    ? `Package ${name} dequeued`
                    : `Package ${name} queued for deletion`,
                  {
                    variant: 'error'
                  }
                )
                uninstall(name)
                setInstalled(false)
              }}
              variant="outlined"
              size="medium"
            >
              Uninstall
            </Button>
          ) : (
            <Button
              classes={{ outlined: classes.install }}
              disabled={isQueued && isBusy}
              onClick={() => {
                enqueueSnackbar(
                  packages.find((el: QueueNode) => el.name === name)
                    ? `Package ${name} dequeued`
                    : `Package ${name} queued for installation`,
                  {
                    variant: 'info'
                  }
                )
                install(name)
                setInstalled(true)
              }}
              variant="outlined"
              size="medium"
            >
              Install
            </Button>
          ))}
      </CardActions>
    </Card>
  )
}

export default connector(PackagePreview)
