import React, { useEffect, useState } from 'react'

import { connect, ConnectedProps } from 'react-redux'
import { goBack, push } from 'connected-react-router'

import {
  Box,
  Button,
  Accordion,
  AccordionActions,
  AccordionDetails,
  AccordionSummary,
  Link,
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
import { Review, SnapPackage } from '../../actions/apt'
import { shell } from 'electron'
import { useTranslation } from 'react-i18next'

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

const mapStateToProps = ({
  settings: { APIUrl },
  queue: { packages, isBusy },
  auth: { token, role, login }
}: RootState) => ({ APIUrl, packages, isBusy, token, role, login })

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
  role,
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
  fetchSnapPackage,
  login
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
    tracks,
    upgradable,
    screenshots
  } = packageInfo

  const [installedOrQueried, setInstalled] = useState(false)
  const [queuedUpgrade, setQueuedUpgrade] = useState(false)
  const [rating, setRating] = useState(0)
  const [selectedVersion, selectVersion] = useState('//')
  const [reviews, setReviews] = useState(Array<Review>())
  const [reviewsExpanded, setReviewsExpanded] = useState(false)

  useEffect(() => {
    setAvailable(true)
    setLoading(true)
    let active = true
    const f = async () => {
      try {
        const res = unwrapResult(await fetchSnapPackage(name))
        if (!active) return
        setPackageInfo(res)
        selectVersion(`${res.tracks[0]}`)
      } catch {
        setAvailable(false)
      }
      setLoading(false)
    }
    f()
    return () => {
      active = false
    }
  }, [name])

  useEffect(() => {
    setInstalled(packageInfo.installed)
    setRating(packageInfo.rating)
    setReviews(packageInfo.reviews)
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

  const destroyReviewComponent = (id: number) => {
    // Immutability is first
    const newReviews = [...reviews.slice(0, id), ...reviews.slice(id + 1)]
    setReviews(newReviews)
    if (newReviews.length === 0) setReviewsExpanded(false)
  }

  const addReviewComponent = (rating: number, commentary: string) => {
    setReviews([...reviews, { author: login, rating, commentary }])
  }

  const { t } = useTranslation()

  return loading ? (
    <PackageInfoSkeleton />
  ) : (
    <>
      <Paper elevation={8} className={classes.root}>
        <Button size="large" startIcon={<ArrowBack />} onClick={() => goBack()}>
          {t('goback')}
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
                {selectedVersion.split(':')[1]}
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
              {t('pkgNotAvailable')}
            </Typography>
          )}
        </Paper>
        {available && (
          <>
            <Accordion disabled={!packageInfo} className={classes.panel} defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMore />} aria-controls="panel1a-content">
                <Typography variant="h5">{t('generalInfo')}</Typography>
              </AccordionSummary>
              <AccordionDetails className={classes.grid}>
                <Typography variant="h6">{t('version')}:</Typography>
                <Select
                  variant="outlined"
                  value={selectedVersion}
                  onChange={({ target: { value } }) => {
                    selectVersion(value as string)
                  }}
                >
                  {tracks.map(track => (
                    <MenuItem key={`item-${track}`} value={track}>
                      {track.split(':')[0]}
                    </MenuItem>
                  ))}
                </Select>
                <Typography variant="h6">{t('mantainer')}:</Typography>
                <Paper variant="outlined" className={classes.contentColumn}>
                  <Typography variant="body1">{publisher}</Typography>
                </Paper>
                {description && (
                  <>
                    <Typography variant="h6">{t('description')}:</Typography>
                    <Paper variant="outlined" className={classes.contentColumn}>
                      <Typography variant="body1">{description}</Typography>
                    </Paper>
                  </>
                )}
                {snapId && (
                  <>
                    <Typography variant="h6">Snap-ID:</Typography>
                    <Paper variant="outlined" className={classes.contentColumn}>
                      <Typography variant="body1">{snapId}</Typography>
                    </Paper>
                  </>
                )}
                {summary && (
                  <>
                    <Typography variant="h6">{t('summary')}:</Typography>
                    <Paper variant="outlined" className={classes.contentColumn}>
                      <Typography variant="body1">{summary}</Typography>
                    </Paper>
                  </>
                )}
                {storeUrl && (
                  <>
                    <Typography variant="h6">Store-URL:</Typography>
                    <Paper variant="outlined" className={classes.contentColumn}>
                      <Link
                        component="button"
                        variant="body1"
                        onClick={() => shell.openExternal(storeUrl)}
                      >
                        {storeUrl}
                      </Link>
                    </Paper>
                  </>
                )}
                {contact && (
                  <>
                    <Typography variant="h6">{t('contact')}:</Typography>
                    <Paper variant="outlined" className={classes.contentColumn}>
                      <Link
                        component="button"
                        variant="body1"
                        onClick={() => shell.openExternal(contact)}
                      >
                        {contact}
                      </Link>
                    </Paper>
                  </>
                )}
                {license && (
                  <>
                    <Typography variant="h6">{t('license')}:</Typography>
                    <Paper variant="outlined" className={classes.contentColumn}>
                      <Typography variant="body1">{license}</Typography>
                    </Paper>
                  </>
                )}
                {refreshDate && (
                  <>
                    <Typography variant="h6">{t('refreshDate')}:</Typography>
                    <Paper variant="outlined" className={classes.contentColumn}>
                      <Typography variant="body1">{refreshDate}</Typography>
                    </Paper>
                  </>
                )}
                {tracking && (
                  <>
                    <Typography variant="h6">{t('tracking')}:</Typography>
                    <Paper variant="outlined" className={classes.contentColumn}>
                      <Typography variant="body1">{tracking}</Typography>
                    </Paper>
                  </>
                )}
              </AccordionDetails>
            </Accordion>
            <Accordion disabled={!screenshots || screenshots.length === 0}>
              <AccordionSummary expandIcon={<ExpandMore />} aria-controls="panel1a-content">
                <Typography variant="h5">{t('screenshots')}</Typography>
              </AccordionSummary>
              <AccordionDetails style={{ justifyContent: 'center' }}>
                <Box width="90%">
                  <Slider>
                    {screenshots?.map((link, k) => (
                      <div key={`${name}-screenshot-${k}`}>
                        <img style={{ margin: 'auto' }} src={link} alt="screenshot" />
                      </div>
                    ))}
                  </Slider>
                </Box>
              </AccordionDetails>
            </Accordion>
            <Accordion
              disabled={!reviews || reviews?.length === 0}
              expanded={reviewsExpanded}
              onChange={() => {
                if (reviews && reviews.length !== 0) setReviewsExpanded(!reviewsExpanded)
              }}
            >
              <AccordionSummary expandIcon={<ExpandMore />} aria-controls="panel1a-content">
                <Typography variant="h5">Reviews</Typography>
              </AccordionSummary>
              <AccordionDetails style={{ justifyContent: 'center' }}>
                {reviews?.map(({ author, rating, commentary }, k) => (
                  <ReviewRating
                    key={`${name}-review-${k}`}
                    id={k}
                    packageName={name}
                    destroyReviewComponent={destroyReviewComponent}
                    role={role}
                    author={author}
                    rating={rating}
                    commentary={commentary}
                  />
                ))}
              </AccordionDetails>
            </Accordion>
            <AccordionActions className={classes.actions}>
              {upgradable &&
                (queuedUpgrade ? (
                  <Button
                    variant="outlined"
                    disabled={isBusy}
                    className={cls(classes.button, classes.uninstall)}
                    onClick={() => {
                      enqueueSnackbar(
                        `${t('package')} ${name}@${selectedVersion.split(':')[1]} ${t('dequeued')}`,
                        {
                          variant: 'error'
                        }
                      )
                      dontUpgrade({ name, version: selectedVersion, source: 'SNAP' })
                      setQueuedUpgrade(false)
                    }}
                    size="large"
                  >
                    {t('cancelUpgrade')}
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
                        `${t('package')} ${name}@${selectedVersion.split(':')[1]} ${t(
                          'queuedUpgrade'
                        )}`,
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
                        ? `${t('package')} ${name}@${selectedVersion.split(':')[1]} ${t(
                            'dequeued'
                          )}`
                        : `${t('package')} ${name}@${selectedVersion.split(':')[1]} ${t(
                            'queuedDel'
                          )}`,
                      {
                        variant: 'error'
                      }
                    )
                    uninstall({ name, version: selectedVersion, source: 'SNAP' })
                    setInstalled(false)
                  }}
                  size="large"
                >
                  {t('uninstall')}
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
                        ? `${t('package')} ${name}@${selectedVersion.split(':')[1]} ${t(
                            'dequeued'
                          )}`
                        : `${t('package')} ${name}@${selectedVersion.split(':')[1]} ${t(
                            'queuedInst'
                          )}`,
                      {
                        variant: 'info'
                      }
                    )
                    install({ name, version: selectedVersion, source: 'SNAP' })
                    setInstalled(true)
                  }}
                >
                  {t('install')}
                </Button>
              )}
            </AccordionActions>
          </>
        )}
      </Paper>
      {authOpened && <AuthDialog onClose={() => setAuthOpened(false)} />}
      {ratingOpened && (
        <RatingDialog
          name={name}
          onClose={() => setRatingOpened(false)}
          rating={rating}
          addFn={addReviewComponent}
        />
      )}
    </>
  )
}

export default connector(withRouter(PackageInfo))
