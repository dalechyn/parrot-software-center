import React, { useEffect, useState, Fragment } from 'react'

import { connect, ConnectedProps } from 'react-redux'
import { goBack, push } from 'connected-react-router'

import {
  Box,
  Button,
  ExpansionPanel,
  ExpansionPanelActions,
  ExpansionPanelDetails,
  ExpansionPanelSummary,
  Link,
  makeStyles,
  Paper,
  Typography
} from '@material-ui/core'
import { Rating } from '@material-ui/lab'
import Slider from 'react-slick'
import { ArrowBack, ExpandMore } from '@material-ui/icons'
import { blue, green } from '@material-ui/core/colors'
import dummyPackageImg from '../../assets/package.png'
import { Img } from 'react-image'
import { useSnackbar } from 'notistack'
import cls from 'classnames'
import { AptActions, QueueActions } from '../../actions'
import { unwrapResult } from '@reduxjs/toolkit'
import PackageInfoSkeleton from './skeleton'
import { shell } from 'electron'
import { QueueNode } from '../Queue'
import { RouteComponentProps, withRouter } from 'react-router-dom'
import { AuthDialog, RatingDialog, ReviewRating } from '../../components'
import { Package, PackageOptionalFields } from '../../actions/apt'

const useStyles = makeStyles(theme => ({
  root: {
    margin: theme.spacing(4),
    padding: theme.spacing(4)
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
  if (!str) return
  const cleared = str.replace(/^ \./gm, '\n').replace(/^ /gm, '')
  const upperCased = cleared.charAt(0).toUpperCase() + cleared.slice(1)
  const firstSentenceDotted = upperCased.replace(/\n/, '.\n')
  const lines = firstSentenceDotted.split('\n')
  lines[0] = lines[0] + '\n'
  return lines.join('')
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
  fetchPackage: AptActions.fetchPackage
}

const connector = connect(mapStateToProps, mapDispatchToProps)

type PackageInfoProps = ConnectedProps<typeof connector> & RouteComponentProps<{ name: string }>

const PackageInfo = ({
  goBack,
  packages,
  install,
  uninstall,
  dontUpgrade,
  push,
  upgrade,
  match,
  APIUrl,
  isBusy,
  token,
  fetchPackage
}: PackageInfoProps) => {
  const classes = useStyles()

  const { name } = match.params
  const [loading, setLoading] = useState(true)
  const [packageInfo, setPackageInfo] = useState({} as Package)
  const [authOpened, setAuthOpened] = useState(false)
  const [ratingOpened, setRatingOpened] = useState(false)
  const [available, setAvailable] = useState(true)

  const {
    version,
    maintainer,
    description,
    name: _,
    depends,
    recommends,
    replaces,
    breaks,
    suggests,
    conflicts,
    provides,
    bugs,
    homepage,
    reviews,
    rating: ratingInitial,
    upgradable,
    upgradeQueued,
    installed,
    screenshots,
    ...rest
  } = packageInfo

  const [installedOrQueried, setInstalled] = useState(installed)
  const [queuedUpgrade, setQueuedUpgrade] = useState(upgradeQueued)
  const [rating, setRating] = useState(ratingInitial)

  useEffect(() => {
    setAvailable(true)
    setLoading(true)
    const f = async () => {
      try {
        setPackageInfo(unwrapResult(await fetchPackage(name)))
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
                {version}
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
                <Paper variant="outlined" className={classes.contentColumn}>
                  <Typography variant="body1">{version}</Typography>
                </Paper>
                <Typography variant="h6">Maintainer:</Typography>
                <Paper variant="outlined" className={classes.contentColumn}>
                  <Typography variant="body1">{maintainer}</Typography>
                </Paper>
                <Typography variant="h6">Description:</Typography>
                <Paper variant="outlined" className={classes.contentColumn}>
                  <Typography variant="body1">{processDescription(description)}</Typography>
                </Paper>
              </ExpansionPanelDetails>
            </ExpansionPanel>
            <ExpansionPanel disabled={!packageInfo && Object.keys(rest).length === 0}>
              <ExpansionPanelSummary expandIcon={<ExpandMore />} aria-controls="panel1a-content">
                <Typography variant="h5">Additional info</Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails className={classes.grid}>
                {depends && (
                  <>
                    <Typography variant="h6">Depends:</Typography>
                    <Paper variant="outlined" className={classes.contentColumn}>
                      {depends.split(', ').map((d, i, dependsSplitted) => {
                        const [depName, ...rest] = d.split(' ')
                        return (
                          <div style={{ display: 'inline-block' }} key={`${name}-depends-${d}`}>
                            <Typography variant="body1">
                              <Link
                                component="button"
                                variant="body1"
                                key={`${name}-depends-${d}`}
                                onClick={() => push(`/package/${depName}`)}
                              >
                                {depName}
                              </Link>
                              {' ' + rest.join('')}
                              {i !== dependsSplitted.length - 1 && ', '}
                            </Typography>
                          </div>
                        )
                      })}
                    </Paper>
                  </>
                )}
                {breaks && (
                  <>
                    <Typography variant="h6">Breaks:</Typography>
                    <Paper variant="outlined" className={classes.contentColumn}>
                      {breaks.split(', ').map((b, i, breaksSplitted) => {
                        const [breakName, ...rest] = b.split(' ')
                        return (
                          <div style={{ display: 'inline-block' }} key={`${name}-breals-${b}`}>
                            <Typography variant="body1">
                              <Link
                                component="button"
                                variant="body1"
                                onClick={() => push(`/package/${breakName}`)}
                              >
                                {breakName}
                              </Link>
                              {' ' + rest.join('')}
                              {i !== breaksSplitted.length - 1 && ', '}
                            </Typography>
                          </div>
                        )
                      })}
                    </Paper>
                  </>
                )}
                {recommends && (
                  <>
                    <Typography variant="h6">Recommends:</Typography>
                    <Paper variant="outlined" className={classes.contentColumn}>
                      {recommends.split(', ').map((b, i, recommendsSplitted) => {
                        const [recommendName, ...rest] = b.split(' ')
                        return (
                          <div style={{ display: 'inline-block' }} key={`${name}-recommends-${b}`}>
                            <Typography variant="body1">
                              <Link
                                component="button"
                                variant="body1"
                                onClick={() => push(`/package/${recommendName}`)}
                              >
                                {recommendName}
                              </Link>
                              {' ' + rest.join('')}
                              {i !== recommendsSplitted.length - 1 && ', '}
                            </Typography>
                          </div>
                        )
                      })}
                    </Paper>
                  </>
                )}
                {conflicts && (
                  <>
                    <Typography variant="h6">Conflicts:</Typography>
                    <Paper variant="outlined" className={classes.contentColumn}>
                      {conflicts.split(', ').map((b, i, conflictsSplitted) => {
                        const [conflictName, ...rest] = b.split(' ')
                        return (
                          <div style={{ display: 'inline-block' }} key={`${name}-conflicts-${b}`}>
                            <Typography variant="body1">
                              <Link
                                component="button"
                                variant="body1"
                                onClick={() => push(`/package/${conflictName}`)}
                              >
                                {conflictName}
                              </Link>
                              {' ' + rest.join('')}
                              {i !== conflictsSplitted.length - 1 && ', '}
                            </Typography>
                          </div>
                        )
                      })}
                    </Paper>
                  </>
                )}
                {suggests && (
                  <>
                    <Typography variant="h6">Suggests:</Typography>
                    <Paper variant="outlined" className={classes.contentColumn}>
                      {suggests.split(', ').map((b, i, suggestsSplitted) => {
                        const [suggestedName, ...rest] = b.split(' ')
                        return (
                          <div style={{ display: 'inline-block' }} key={`${name}-suggests-${b}`}>
                            <Typography variant="body1">
                              <Link
                                component="button"
                                variant="body1"
                                onClick={() => push(`/package/${suggestedName}`)}
                              >
                                {suggestedName}
                              </Link>
                              {' ' + rest.join('')}
                              {i !== suggestsSplitted.length - 1 && ', '}
                            </Typography>
                          </div>
                        )
                      })}
                    </Paper>
                  </>
                )}
                {replaces && (
                  <>
                    <Typography variant="h6">Replaces:</Typography>
                    <Paper variant="outlined" className={classes.contentColumn}>
                      {replaces.split(', ').map((b, i, replacesSplitted) => {
                        const [replaceName, ...rest] = b.split(' ')
                        return (
                          <div style={{ display: 'inline-block' }} key={`${name}-replaces-${b}`}>
                            <Typography variant="body1">
                              <Link
                                component="button"
                                variant="body1"
                                onClick={() => push(`/package/${replaceName}`)}
                              >
                                {replaceName}
                              </Link>
                              {' ' + rest.join('')}
                              {i !== replacesSplitted.length - 1 && ', '}
                            </Typography>
                          </div>
                        )
                      })}
                    </Paper>
                  </>
                )}
                {provides && (
                  <>
                    <Typography variant="h6">Provides:</Typography>
                    <Paper variant="outlined" className={classes.contentColumn}>
                      {provides.split(', ').map((b, i, providesSplitted) => {
                        const [provideName, ...rest] = b.split(' ')
                        const version = rest.join('')
                        return (
                          <div style={{ display: 'inline-block' }} key={`${name}-provides-${b}`}>
                            <Typography variant="body1">
                              <Link
                                component="button"
                                variant="body1"
                                onClick={() => push(`/package/${provideName}`)}
                              >
                                {provideName}
                              </Link>
                              {version && ` ${version}`}
                              {i !== providesSplitted?.length - 1 && ', '}
                            </Typography>
                          </div>
                        )
                      })}
                    </Paper>
                  </>
                )}
                {homepage && (
                  <>
                    <Typography variant="h6">Homepage:</Typography>
                    <Paper variant="outlined" className={classes.contentColumn}>
                      <Typography variant="body1">
                        <Link
                          component="button"
                          variant="body1"
                          onClick={() => shell.openExternal(homepage)}
                        >
                          {homepage}
                        </Link>
                      </Typography>
                    </Paper>
                  </>
                )}
                {bugs && (
                  <>
                    <Typography variant="h6">Bugs:</Typography>
                    <Paper variant="outlined" className={classes.contentColumn}>
                      <Typography variant="body1">
                        <Link
                          component="button"
                          variant="body1"
                          onClick={() => shell.openExternal(bugs)}
                        >
                          {bugs}
                        </Link>
                      </Typography>
                    </Paper>
                  </>
                )}
                {rest &&
                  Object.keys(rest).length !== 0 &&
                  Object.keys(rest).map(prop => {
                    const key = prop as keyof PackageOptionalFields
                    const additionalInfo = rest as PackageOptionalFields
                    return (
                      <Fragment key={`${name}@${version}@${key}`}>
                        <Typography style={{ width: 'min-content' }} variant="h6">
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </Typography>
                        <Paper variant="outlined" className={classes.contentColumn}>
                          <Typography variant="body1">{additionalInfo[key]}</Typography>
                        </Paper>
                      </Fragment>
                    )
                  })}
              </ExpansionPanelDetails>
            </ExpansionPanel>
            <ExpansionPanel disabled={screenshots === 0}>
              <ExpansionPanelSummary expandIcon={<ExpandMore />} aria-controls="panel1a-content">
                <Typography variant="h5">Screenshots</Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails style={{ justifyContent: 'center' }}>
                <Box width="90%">
                  <Slider>
                    {Array.from({ length: screenshots }, (_, k) => (
                      <div key={`${name}-screen-${k}`}>
                        <img
                          style={{ margin: 'auto' }}
                          src={`${APIUrl}/assets/screenshots/${name}/${k}.png`}
                          alt="screenshot"
                        />
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
                      enqueueSnackbar(`Package ${name}@${version} dequeued`, {
                        variant: 'error'
                      })
                      dontUpgrade(name)
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
                      enqueueSnackbar(`Package ${name}@${version} queued for upgrade`, {
                        variant: 'success'
                      })
                      upgrade(name)
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
                        ? `Package ${name}@${version} dequeued`
                        : `Package ${name}@${version} queued for deletion`,
                      {
                        variant: 'error'
                      }
                    )
                    uninstall(name)
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
                        ? `Package ${name}@${version} dequeued`
                        : `Package ${name}@${version} queued for installation`,
                      {
                        variant: 'info'
                      }
                    )
                    install(name)
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
