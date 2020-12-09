import React, { useEffect, useState, Fragment } from 'react'

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
  Paper,
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
import { shell } from 'electron'
import { QueueNode } from '../Queue'
import { RouteComponentProps, withRouter } from 'react-router-dom'
import { AuthDialog, RatingDialog, ReviewRating } from '../../components'
import { AptPackage, AptPackageOptionalFields, Review } from '../../actions/apt'
import { useTranslation } from 'react-i18next';

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
  if (!str) return
  const cleared = str.replace(/^ \./gm, '\n').replace(/^ /gm, '')
  const upperCased = cleared.charAt(0).toUpperCase() + cleared.slice(1)
  const firstSentenceDotted = upperCased.replace(/\n/, '.\n')
  const lines = firstSentenceDotted.split('\n')
  lines[0] = lines[0] + '\n'
  return lines.join('')
}

const createPackageRelationsProcessor = (innerPush: typeof push) => (
  input: string,
  relation: string
) =>
  input.split(', ').map((r, i, inputSplitted) => (
    <>
      <div style={{ display: 'inline-block' }} key={`${relation}-${r}-${i}`}>
        <Typography key={`outer-${relation}-${i}`} variant="body1" style={{ whiteSpace: 'nowrap' }}>
          {r.split(' | ').map((orConflicts, orI, arr) => {
            const [name, ...rest] = orConflicts.split(' ')
            return (
              <>
                <Link
                  component="button"
                  variant="body1"
                  key={`link-${relation}-${r}`}
                  onClick={() => innerPush(`/package/apt/${name}`)}
                  noWrap
                >
                  {name}
                </Link>
                {' ' + rest.join('')}
                {arr.length > 1 && orI !== arr.length - 1 && ' | '}
              </>
            )
          })}
        </Typography>
      </div>
      {i !== inputSplitted.length - 1 && ', '}
    </>
  ))

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
  fetchAptPackage: AptActions.fetchAptPackage
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
  push,
  upgrade,
  match,
  APIUrl,
  isBusy,
  token,
  fetchAptPackage,
  login
}: PackageInfoProps) => {
  const classes = useStyles()

  const { name } = match.params
  const [loading, setLoading] = useState(true)
  const [packageInfo, setPackageInfo] = useState({} as AptPackage)
  const [authOpened, setAuthOpened] = useState(false)
  const [ratingOpened, setRatingOpened] = useState(false)
  const [available, setAvailable] = useState(true)
  const processPackageRelations = createPackageRelationsProcessor(push)

  const {
    version,
    maintainer,
    description,
    source,
    name: _a,
    depends,
    recommends,
    replaces,
    breaks,
    suggests,
    conflicts,
    provides,
    bugs,
    homepage,
    upgradable,
    screenshots,
    reviews: _b,
    installed: _c,
    upgradeQueued: _d,
    rating: _f,
    ...rest
  } = packageInfo

  const [installedOrQueried, setInstalled] = useState(false)
  const [queuedUpgrade, setQueuedUpgrade] = useState(false)
  const [rating, setRating] = useState(0)
  const [reviews, setReviews] = useState(Array<Review>())
  const [reviewsExpanded, setReviewsExpanded] = useState(false)

  useEffect(() => {
    setAvailable(true)
    setLoading(true)
    const f = async () => {
      try {
        setPackageInfo(unwrapResult(await fetchAptPackage(name)))
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

  const { t } = useTranslation();

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
              <img className={classes.media} src={dummyPackageImg} alt={`${t('noPkgFound')}`} />
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
              <Typography className={classes.source} variant="body2">
                {source}
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
                <Paper variant="outlined" className={classes.contentColumn}>
                  <Typography variant="body1">{version}</Typography>
                </Paper>
                <Typography variant="h6">{t('mantainer')}:</Typography>
                <Paper variant="outlined" className={classes.contentColumn}>
                  <Typography variant="body1">{maintainer}</Typography>
                </Paper>
                <Typography variant="h6">{t('description')}:</Typography>
                <Paper variant="outlined" className={classes.contentColumn}>
                  <Typography variant="body1">{processDescription(description)}</Typography>
                </Paper>
              </AccordionDetails>
            </Accordion>
            <Accordion disabled={!packageInfo && Object.keys(rest).length === 0}>
              <AccordionSummary expandIcon={<ExpandMore />} aria-controls="panel1a-content">
                <Typography variant="h5">{t('additionalInfo')}</Typography>
              </AccordionSummary>
              <AccordionDetails className={classes.grid}>
                {depends && (
                  <>
                    <Typography variant="h6">Depends:</Typography>
                    <Paper variant="outlined" className={classes.contentColumn}>
                      {processPackageRelations(depends, 'depends')}
                    </Paper>
                  </>
                )}
                {breaks && (
                  <>
                    <Typography variant="h6">Breaks:</Typography>
                    <Paper variant="outlined" className={classes.contentColumn}>
                      {processPackageRelations(breaks, 'breaks')}
                    </Paper>
                  </>
                )}
                {recommends && (
                  <>
                    <Typography variant="h6">Recommends:</Typography>
                    <Paper variant="outlined" className={classes.contentColumn}>
                      {processPackageRelations(recommends, 'recommends')}
                    </Paper>
                  </>
                )}
                {conflicts && (
                  <>
                    <Typography variant="h6">Conflicts:</Typography>
                    <Paper variant="outlined" className={classes.contentColumn}>
                      {processPackageRelations(conflicts, 'conflicts')}
                    </Paper>
                  </>
                )}
                {suggests && (
                  <>
                    <Typography variant="h6">Suggests:</Typography>
                    <Paper variant="outlined" className={classes.contentColumn}>
                      {processPackageRelations(suggests, 'suggests')}
                    </Paper>
                  </>
                )}
                {replaces && (
                  <>
                    <Typography variant="h6">Replaces:</Typography>
                    <Paper variant="outlined" className={classes.contentColumn}>
                      {processPackageRelations(replaces, 'replaces')}
                    </Paper>
                  </>
                )}
                {provides && (
                  <>
                    <Typography variant="h6">Provides:</Typography>
                    <Paper variant="outlined" className={classes.contentColumn}>
                      {processPackageRelations(provides, 'provides')}
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
                    const key = prop as keyof AptPackageOptionalFields
                    const additionalInfo = rest as AptPackageOptionalFields
                    return (
                      <Fragment key={`${name}@${version}@${key}`}>
                        <Typography style={{ width: 'min-content' }} variant="h6">
                          {key.charAt(0).toUpperCase() + key.slice(1)}:
                        </Typography>
                        <Paper variant="outlined" className={classes.contentColumn}>
                          <Typography variant="body1">{additionalInfo[key]}</Typography>
                        </Paper>
                      </Fragment>
                    )
                  })}
              </AccordionDetails>
            </Accordion>
            <Accordion disabled={screenshots.length === 0}>
              <AccordionSummary expandIcon={<ExpandMore />} aria-controls="panel1a-content">
                <Typography variant="h5">{t('screenshots')}</Typography>
              </AccordionSummary>
              <AccordionDetails style={{ justifyContent: 'center' }}>
                <Box width="90%">
                  <Slider>
                    {screenshots.map((link, k) => (
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
                <Typography variant="h5">{t('reviews')}</Typography>
              </AccordionSummary>
              <AccordionDetails style={{ justifyContent: 'center' }}>
                {reviews?.map(({ author, rating, commentary }, k) => (
                  <ReviewRating
                    key={`${name}-review-${k}`}
                    id={k}
                    destroyReviewComponent={destroyReviewComponent}
                    packageName={name}
                    author={author}
                    rating={rating}
                    role={role}
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
                      enqueueSnackbar(`${t('package')} ${name}@${version} ${t('dequeued')}`, {
                        variant: 'error'
                      })
                      dontUpgrade({ name, version, source: 'APT' })
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
                      enqueueSnackbar(`${t('package')} ${name}@${version} ${t('queuedUpgrade')}`, {
                        variant: 'success'
                      })
                      upgrade({ name, version, source: 'APT' })
                      setQueuedUpgrade(true)
                    }}
                  >
                    {t('upgradePkg')}
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
                        ? `${t('package')} ${name}@${version} ${t('dequeued')}`
                        : `${t('package')} ${name}@${version} ${t('queuedDel')}`,
                      {
                        variant: 'error'
                      }
                    )
                    uninstall({ name, version, source: 'APT' })
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
                        ? `${t('package')} ${name}@${version} ${t('dequeued')}`
                        : `${t('package')} ${name}@${version} ${t('queuedInst')}`,
                      {
                        variant: 'info'
                      }
                    )
                    install({ name, version, source: 'APT' })
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
