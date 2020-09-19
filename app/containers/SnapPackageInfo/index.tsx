import React, { useEffect, useState } from 'react'

import { connect, ConnectedProps } from 'react-redux'
import { goBack, push } from 'connected-react-router'

import {
  Box,
  Button,
  ExpansionPanel,
  ExpansionPanelActions,
  ExpansionPanelDetails,
  ExpansionPanelSummary,
  makeStyles,
  MenuItem,
  Paper,
  Select,
  Typography
} from '@material-ui/core'
import { Rating } from '@material-ui/lab'
import Slider from 'react-slick'
import { ArrowBack, ExpandMore } from '@material-ui/icons'
import { blue, green, grey } from '@material-ui/core/colors'
import dummyPackageImg from '../../assets/package.png'
import { Img } from 'react-image'
import { useSnackbar } from 'notistack'
import cls from 'classnames'
import { AptActions, QueueActions } from '../../actions'
import { unwrapResult } from '@reduxjs/toolkit'
import PackageInfoSkeleton from './skeleton'
import { QueueNode } from '../Queue'
import { RouteComponentProps, withRouter } from 'react-router-dom'
import { AuthDialog, RatingDialog, ReviewRating } from '../../components'
import { SnapPackage } from '../../actions/apt'

const useStyles = makeStyles(theme => ({
  root: {
    margin: theme.spacing(4),
    padding: theme.spacing(4)
  },
  source: {
    color: grey[500],
    marginLeft: theme.spacing(2)
  },
  nameContainer: {
    display: 'flex',
    alignItems: 'center',
    marginTop: theme.spacing(2),
    padding: theme.spacing(2)
  },
  panel: {
    marginTop: theme.spacing(2)
  },
  actions: {
    marginTop: theme.spacing(2)
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, auto)',
    gridGap: theme.spacing(2),
    gridAutoColumns: 'minmax(100px, auto)',
    alignItems: 'center',
    whiteSpace: 'pre-wrap',
    marginTop: theme.spacing(1),
    padding: theme.spacing(2)
  },
  contentColumn: {
    padding: theme.spacing(1)
  },
  media: {
    height: 60,
    width: 60,
    marginRight: theme.spacing(2)
  },
  label: {
    marginTop: theme.spacing(4)
  },
  button: {
    marginLeft: 'auto'
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

const processDescription = (str: string) => {
  return str
    .split('\n')
    .map(line => line.slice(2))
    .join('\n')
}

const mapStateToProps = ({
  router: {
    location: { state }
  },
  settings: { APIUrl },
  queue: { packages, isBusy },
  auth: { token }
}: RootState) => ({ ...state, APIUrl, packages, isBusy, token })

const mapDispatchToProps = {
  goBack,
  push,
  install: QueueActions.install,
  uninstall: QueueActions.uninstall,
  dontUpgrade: QueueActions.dontUpgrade,
  upgrade: QueueActions.upgrade,
  fetchSnapPackage: AptActions.fetchSnapPackage
}

const connector = connect(mapStateToProps, mapDispatchToProps)

type PackageInfoProps = ConnectedProps<typeof connector> & RouteComponentProps<{ name: string }>

const PackageInfo = ({
  goBack,
  packages,
  install,
  uninstall,
  dontUpgrade,
  upgrade,
  match,
  APIUrl,
  isBusy,
  token,
  fetchSnapPackage
}: PackageInfoProps) => {
  const classes = useStyles()

  const { name } = match.params
  const [loading, setLoading] = useState(true)
  const [packageInfo, setPackageInfo] = useState({} as SnapPackage)
  const [authOpened, setAuthOpened] = useState(false)
  const [ratingOpened, setRatingOpened] = useState(false)
  const [available, setAvailable] = useState(true)

  const {
    summary,
    publisher,
    storeUrl,
    contact,
    license,
    description,
    snapId,
    refreshDate,
    tracking,
    channels,
    reviews,
    rating: ratingInitial,
    upgradable,
    upgradeQueued,
    installed,
    screenshots
  } = packageInfo

  const [installedOrQueried, setInstalled] = useState(installed)
  const [queuedUpgrade, setQueuedUpgrade] = useState(upgradeQueued)
  const [rating, setRating] = useState(ratingInitial)
  const [selectedVersion, selectVersion] = useState('//')

  useEffect(() => {
    setAvailable(true)
    setLoading(true)
    const f = async () => {
      try {
        const res = unwrapResult(await fetchSnapPackage(name))
        setPackageInfo(res)
        selectVersion(
          `${res.channels[0].name}/${res.channels[0].channels[0].channel}/${res.channels[0].channels[0].branch}`
        )
      } catch {
        setAvailable(false)
      }
      setLoading(false)
    }
    f()
  }, [name])

  useEffect(() => {
    setInstalled(packageInfo.installed)
    setRating(packageInfo.rating)
    setQueuedUpgrade(packageInfo.upgradeQueued)
  }, [packageInfo])

  const { enqueueSnackbar } = useSnackbar()

  const onRatingChange = (_event: React.ChangeEvent<{}>, value: number | null) => {
    if (!value) return
    if (!token) {
      setAuthOpened(true)
      return
    }
    setPackageInfo({ ...packageInfo, rating: value })
    setRating(value)
    setRatingOpened(true)
  }

  return loading ? (
    <PackageInfoSkeleton />
  ) : (
    <>
      <Paper elevation={8} className={classes.root}>
        <Button size="large" startIcon={<ArrowBack />} onClick={() => goBack()}>
          Go Back
        </Button>
        <Paper className={classes.nameContainer} elevation={10}>
          <Img
            className={classes.media}
            src={`${APIUrl}/assets/packages/${name}.png`}
            unloader={
              <img className={classes.media} src={dummyPackageImg} alt={'No Package Found'} />
            }
          />
          <Typography style={{ color: green[400] }} variant="h5">
            {name}
          </Typography>
          {available ? (
            <>
              <Typography variant="h5">@</Typography>
              <Typography style={{ color: blue[400] }} variant="h5">
                {selectedVersion.split('/')[2]}
              </Typography>
              <Typography className={classes.source} variant="body2">
                SNAP
              </Typography>
              <Rating
                name="package-rating"
                value={rating}
                style={{ marginLeft: 'auto' }}
                onChange={onRatingChange}
              />
            </>
          ) : (
            <Typography variant="h5" style={{ marginLeft: 'auto' }}>
              This package is not available
            </Typography>
          )}
        </Paper>
        {available && (
          <>
            <ExpansionPanel disabled={!packageInfo} className={classes.panel} defaultExpanded>
              <ExpansionPanelSummary expandIcon={<ExpandMore />} aria-controls="panel1a-content">
                <Typography variant="h5">General info</Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails className={classes.grid}>
                <Typography variant="h6">Version:</Typography>
                <Select
                  variant="outlined"
                  value={selectedVersion}
                  onChange={({ target: { value } }) => {
                    selectVersion(value as string)
                  }}
                >
                  {channels
                    .map(track =>
                      track.channels.map(channel => (
                        <MenuItem
                          key={`item-${track.name}-${channel.channel}-${channel.branch}`}
                          value={`${track.name}/${channel.channel}/${channel.branch}`}
                        >
                          {`${track.name}/${channel.channel}/${channel.branch}`}
                        </MenuItem>
                      ))
                    )
                    .flat()}
                </Select>
                {/*<Paper variant="outlined" className={classes.contentColumn}>
                  <Typography variant="body1">{version}</Typography>
                </Paper>*/}
                <Typography variant="h6">Maintainer:</Typography>
                <Paper variant="outlined" className={classes.contentColumn}>
                  <Typography variant="body1">{publisher}</Typography>
                </Paper>
                <Typography variant="h6">Description:</Typography>
                <Paper variant="outlined" className={classes.contentColumn}>
                  <Typography variant="body1">{processDescription(description)}</Typography>
                </Paper>
                <Typography variant="h6">Snap-ID:</Typography>
                <Paper variant="outlined" className={classes.contentColumn}>
                  <Typography variant="body1">{snapId}</Typography>
                </Paper>
                <Typography variant="h6">Summary:</Typography>
                <Paper variant="outlined" className={classes.contentColumn}>
                  <Typography variant="body1">{summary}</Typography>
                </Paper>
                <Typography variant="h6">Store-URL:</Typography>
                <Paper variant="outlined" className={classes.contentColumn}>
                  <Typography variant="body1">{storeUrl}</Typography>
                </Paper>
                <Typography variant="h6">Contact:</Typography>
                <Paper variant="outlined" className={classes.contentColumn}>
                  <Typography variant="body1">{contact}</Typography>
                </Paper>
                <Typography variant="h6">License:</Typography>
                <Paper variant="outlined" className={classes.contentColumn}>
                  <Typography variant="body1">{license}</Typography>
                </Paper>
                {refreshDate && (
                  <>
                    <Typography variant="h6">Refresh Date:</Typography>
                    <Paper variant="outlined" className={classes.contentColumn}>
                      <Typography variant="body1">{refreshDate}</Typography>
                    </Paper>
                  </>
                )}
                {tracking && (
                  <>
                    <Typography variant="h6">Tracking:</Typography>
                    <Paper variant="outlined" className={classes.contentColumn}>
                      <Typography variant="body1">{tracking}</Typography>
                    </Paper>
                  </>
                )}
              </ExpansionPanelDetails>
            </ExpansionPanel>
            <ExpansionPanel disabled={screenshots.length === 0}>
              <ExpansionPanelSummary expandIcon={<ExpandMore />} aria-controls="panel1a-content">
                <Typography variant="h5">Screenshots</Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails style={{ justifyContent: 'center' }}>
                <Box width="90%">
                  <Slider>
                    {screenshots.map((link, k) => (
                      <div key={`${name}-screenshot-${k}`}>
                        <img style={{ margin: 'auto' }} src={link} alt="screenshot" />
                      </div>
                    ))}
                  </Slider>
                </Box>
              </ExpansionPanelDetails>
            </ExpansionPanel>
            <ExpansionPanel disabled={reviews?.length === 0}>
              <ExpansionPanelSummary expandIcon={<ExpandMore />} aria-controls="panel1a-content">
                <Typography variant="h5">Reviews</Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails style={{ justifyContent: 'center' }}>
                {reviews?.map(({ author, rating, commentary }, k) => (
                  <ReviewRating
                    key={`${name}-review-${k}`}
                    author={author}
                    rating={rating}
                    commentary={commentary}
                  />
                ))}
              </ExpansionPanelDetails>
            </ExpansionPanel>
            <ExpansionPanelActions className={classes.actions}>
              {upgradable &&
                (queuedUpgrade ? (
                  <Button
                    variant="outlined"
                    disabled={isBusy}
                    className={cls(classes.button, classes.uninstall)}
                    onClick={() => {
                      enqueueSnackbar(`Package ${name}@${selectedVersion.split('/')[2]} dequeued`, {
                        variant: 'error'
                      })
                      dontUpgrade({ name, version: selectedVersion, source: 'SNAP' })
                      setQueuedUpgrade(false)
                    }}
                    size="large"
                  >
                    Cancel upgrade
                  </Button>
                ) : (
                  <Button
                    variant="outlined"
                    disabled={isBusy}
                    color="primary"
                    className={cls(classes.button, classes.upgrade)}
                    size="large"
                    onClick={() => {
                      enqueueSnackbar(
                        `Package ${name}@${selectedVersion.split('/')[2]} queued for upgrade`,
                        {
                          variant: 'success'
                        }
                      )
                      upgrade({ name, version: selectedVersion, source: 'SNAP' })
                      setQueuedUpgrade(true)
                    }}
                  >
                    Upgrade
                  </Button>
                ))}
              {installedOrQueried ? (
                <Button
                  variant="outlined"
                  disabled={isBusy}
                  className={cls(classes.button, classes.uninstall)}
                  onClick={() => {
                    enqueueSnackbar(
                      packages.find((el: QueueNode) => el.name === name)
                        ? `Package ${name}@${selectedVersion.split('/')[2]} dequeued`
                        : `Package ${name}@${selectedVersion.split('/')[2]} queued for deletion`,
                      {
                        variant: 'error'
                      }
                    )
                    uninstall({ name, version: selectedVersion, source: 'SNAP' })
                    setInstalled(false)
                  }}
                  size="large"
                >
                  Uninstall
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  disabled={isBusy}
                  color="primary"
                  className={cls(classes.button, classes.install)}
                  size="large"
                  onClick={() => {
                    enqueueSnackbar(
                      packages.find((el: QueueNode) => el.name === name)
                        ? `Package ${name}@${selectedVersion.split('/')[2]} dequeued`
                        : `Package ${name}@${
                            selectedVersion.split('/')[2]
                          } queued for installation`,
                      {
                        variant: 'info'
                      }
                    )
                    install({ name, version: selectedVersion, source: 'SNAP' })
                    setInstalled(true)
                  }}
                >
                  Install
                </Button>
              )}
            </ExpansionPanelActions>
          </>
        )}
      </Paper>
      {authOpened && <AuthDialog onClose={() => setAuthOpened(false)} />}
      {ratingOpened && (
        <RatingDialog name={name} onClose={() => setRatingOpened(false)} rating={rating} />
      )}
    </>
  )
}

export default connector(withRouter(PackageInfo))