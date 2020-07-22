import React, { Fragment, useEffect, useState } from 'react'

import { connect, ConnectedProps } from 'react-redux'
import { goBack, push } from 'connected-react-router'

import {
  Box,
  Button,
  CircularProgress,
  ExpansionPanel,
  ExpansionPanelActions,
  ExpansionPanelDetails,
  ExpansionPanelSummary,
  makeStyles,
  Paper,
  Link,
  Typography
} from '@material-ui/core'
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
import { QueueNode } from '../Queue'
import { INSTALL, UPGRADE } from '../../reducers/queue'
import { RouteComponentProps, withRouter } from 'react-router-dom'

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
    marginTop: theme.spacing(3),
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
  queue: { packages, isBusy }
}: RootState) => ({ ...state, APIUrl, packages, isBusy })

const mapDispatchToProps = {
  goBack,
  push,
  install: QueueActions.install,
  uninstall: QueueActions.uninstall,
  dontUpgrade: QueueActions.dontUpgrade,
  upgrade: QueueActions.upgrade,
  search: AptActions.search,
  status: AptActions.status,
  checkUpgradable: AptActions.checkUpgradable
}

const connector = connect(mapStateToProps, mapDispatchToProps)

const pkgRegex = {
  required: {
    name: /^Package: ([a-z0-9.+-]+)/m,
    version: /^Version: ((?<epoch>[0-9]{1,4}:)?(?<upstream>[A-Za-z0-9~.]+)(?:-(?<debian>[A-Za-z0-9~.]+))?)/m,
    // eslint-disable-next-line no-control-regex
    maintainer: /^Maintainer: ((?<name>(?:[\S ]+\S+)) <(?<email>(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)]))>)/m,
    description: /^Description-(?:[a-z]{2}): (.*(?:\n \S.*)*)/m
  },
  optional: {
    section: /^Section: ([a-z]+)/m,
    priority: /^Priority: (\S+)/m,
    essential: /^Essential: (yes|no)/m,
    architecture: /^Architecture: (.*)/m,
    origin: /^Origin: ([a-z0-9.+-]+)/m,
    bugs: /^Bugs: (?:([a-z]+):\/\/)[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*)/m,
    homepage: /^Homepage: (?:([a-z]+):\/\/)[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*)/m,
    tag: /^Tag: ((?: ?[A-Za-z-+:]*(?:,(?:[ \n])?)?)+)/m,
    source: /^Source: ([a-zA-Z0-9-+.]+)/m,
    depends: /^Depends: ((?:(?:(?:(?:[a-z0-9.+-]+(?: \((?:(?:<<|>>|<=|>=|=) (?:[0-9]{1,4}:)?(?:[A-Za-z0-9~.]+)(?:-(?:[A-Za-z0-9~.]+))?)\))?)(?:, )?)+)(?: \| )?)+)/m,
    preDepends: /^Pre-Depends: ((?:(?:(?:(?:[a-z0-9.+-]+(?: \((?:(?:<<|>>|<=|>=|=) (?:[0-9]{1,4}:)?(?:[A-Za-z0-9~.]+)(?:-(?:[A-Za-z0-9~.]+))?)\))?)(?:, )?)+)(?: \| )?)+)/m,
    recommends: /^Recommends: ((?:(?:(?:(?:[a-z0-9.+-]+(?: \((?:(?:<<|>>|<=|>=|=) (?:[0-9]{1,4}:)?(?:[A-Za-z0-9~.]+)(?:-(?:[A-Za-z0-9~.]+))?)\))?)(?:, )?)+)(?: \| )?)+)/m,
    suggests: /^Suggests: ((?:(?:(?:(?:[a-z0-9.+-]+(?: \((?:(?:<<|>>|<=|>=|=) (?:[0-9]{1,4}:)?(?:[A-Za-z0-9~.]+)(?:-(?:[A-Za-z0-9~.]+))?)\))?)(?:, )?)+)(?: \| )?)+)/m,
    breaks: /^Breaks: ((?:(?:[a-z0-9.+-]+(?: \((?:(?:<<|>>|<=|>=|=) (?:[0-9]{1,4}:)?(?:[A-Za-z0-9~.]+)(?:-(?:[A-Za-z0-9~.]+))?)\))?)(?:, )?)+)/m,
    conflicts: /^Conflicts: ((?:(?:[a-z0-9.+-]+(?: \((?:(?:<<|>>|<=|>=|=) (?:[0-9]{1,4}:)?(?:[A-Za-z0-9~.]+)(?:-(?:[A-Za-z0-9~.]+))?)\))?)(?:, )?)+)/m,
    replaces: /^Replaces: ((?:(?:[a-z0-9.+-]+(?: \((?:(?:<<|>>|<=|>=|=) (?:[0-9]{1,4}:)?(?:[A-Za-z0-9~.]+)(?:-(?:[A-Za-z0-9~.]+))?)\))?)(?:, )?)+)/m,
    provides: /^Provides: ((?:(?:[a-z0-9.+-]+(?: \((?:(?:<<|>>|<=|>=|=) (?:[0-9]{1,4}:)?(?:[A-Za-z0-9~.]+)(?:-(?:[A-Za-z0-9~.]+))?)\))?)(?:, )?)+)/m,
    installedSize: /^Installed-Size: (.*)/m,
    downloadSize: /^Download-Size: (.*)/m,
    aptManualInstalled: /^APT-Manual-Installed: (.*)/m,
    aptSources: /^APT-Sources: (https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*)(?: (?:\S+ ?)+))/m
  }
}
export type Package = {
  [K in keyof (typeof pkgRegex.required & Partial<typeof pkgRegex.optional>)]: string
}
type PackageInfoProps = ConnectedProps<typeof connector> & RouteComponentProps<{ name: string }>

const PackageInfo = ({
  goBack,
  packages,
  install,
  uninstall,
  search,
  dontUpgrade,
  push,
  upgrade,
  match,
  APIUrl,
  status,
  checkUpgradable,
  isBusy
}: PackageInfoProps) => {
  const classes = useStyles()

  const { name } = match.params
  const [loading, setLoading] = useState(true)
  const [installedOrQueried, setInstalled] = useState(false)
  const [upgradable, setUpgradable] = useState(false)
  const [queuedUpgrade, setQueuedUpgrade] = useState(false)
  const [packageInfo, setPackageInfo] = useState({} as Package)
  const [screenshots, setScreenshots] = useState(0)

  useEffect(() => {
    setPackageInfo({} as Package)
    const foundPackage = packages.find((pkg: QueueNode) => name === pkg.name)
    if (foundPackage) {
      setQueuedUpgrade(true)
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
        setLoading(false)
      })()
    const f = async () => {
      const queuePackage = packages.find((pkg: QueueNode) => name === pkg.name)
      if (queuePackage) {
        setQueuedUpgrade(true)
        if (queuePackage.flag === INSTALL) setInstalled(true)
      }
      const searchWrappedResult = await search(name)
      if (AptActions.search.rejected.match(searchWrappedResult)) {
        alert(searchWrappedResult.error.message)
        return
      }

      const searchResult = unwrapResult(searchWrappedResult)
      const newPackage: Package = {
        name: '',
        description: '',
        maintainer: '',
        version: ''
      }

      if (
        !Object.keys(pkgRegex.required).every(prop => {
          const key = prop as keyof typeof pkgRegex.required
          const match = pkgRegex.required[key].exec(searchResult)
          if (match) newPackage[key] = match[1]
          else console.warn(`Missing ${key}`)
          return match
        })
      ) {
        console.warn(`Required fields are missing, skipping invalid package`, searchResult)
        return
      }

      // Filling optional fields
      Object.keys(pkgRegex.optional).forEach(prop => {
        try {
          const key = prop as keyof typeof pkgRegex.optional
          const match = pkgRegex.optional[key].exec(searchResult)
          if (match) newPackage[key] = match[1]
        } catch (e) {
          console.error(e)
        }
      })

      try {
        setScreenshots(await (await fetch(`${APIUrl}/assets/screenshots/${name}/info`)).json())
      } catch (e) {}
      setPackageInfo(newPackage)
    }
    f()
  }, [name])
  const { enqueueSnackbar } = useSnackbar()
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
    ...rest
  } = packageInfo
  return packageInfo ? (
    <Paper elevation={8} className={classes.root}>
      <Button size="large" startIcon={<ArrowBack />} onClick={() => goBack()}>
        Go Back
      </Button>
      <Paper className={classes.nameContainer} elevation={10}>
        <Img
          className={classes.media}
          src={`${APIUrl}/assets/packages/${name}`}
          unloader={
            <img className={classes.media} src={dummyPackageImg} alt={'No Package Found'} />
          }
        />
        <Typography style={{ color: green[400] }} variant="h5">
          {name}
        </Typography>
        <Typography variant="h5">@</Typography>
        <Typography style={{ color: blue[400] }} variant="h5">
          {version}
        </Typography>
      </Paper>
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
                <Typography variant="body1">
                  {depends.split(', ').map((d, i, dependsSplitted) => {
                    const [depName, ...rest] = d.split(' ')
                    return (
                      <>
                        <Link
                          component="button"
                          variant="body1"
                          key={`${name}-dep-${d}`}
                          onClick={() => push(`/package/${depName}`)}
                        >
                          {depName}
                        </Link>
                        {' ' + rest.join('')}
                        {i !== dependsSplitted.length - 1 && ', '}
                      </>
                    )
                  })}
                </Typography>
              </Paper>
            </>
          )}
          {breaks && (
            <>
              <Typography variant="h6">Breaks:</Typography>
              <Paper variant="outlined" className={classes.contentColumn}>
                <Typography variant="body1">
                  {breaks.split(', ').map((b, i, breaksSplitted) => {
                    const [breakName, ...rest] = b.split(' ')
                    return (
                      <>
                        <Link
                          component="button"
                          variant="body1"
                          key={`${name}-breaks-${b}`}
                          onClick={() => push(`/package/${breakName}`)}
                        >
                          {breakName}
                        </Link>
                        {' ' + rest.join('')}
                        {i !== breaksSplitted.length - 1 && ', '}
                      </>
                    )
                  })}
                </Typography>
              </Paper>
            </>
          )}
          {recommends && (
            <>
              <Typography variant="h6">Recommends:</Typography>
              <Paper variant="outlined" className={classes.contentColumn}>
                <Typography variant="body1">
                  {recommends.split(', ').map((b, i, recommendsSplitted) => {
                    const [recommendName, ...rest] = b.split(' ')
                    return (
                      <>
                        <Link
                          component="button"
                          variant="body1"
                          key={`${name}-recommends-${b}`}
                          onClick={() => push(`/package/${recommendName}`)}
                        >
                          {recommendName}
                        </Link>
                        {' ' + rest.join('')}
                        {i !== recommendsSplitted.length - 1 && ', '}
                      </>
                    )
                  })}
                </Typography>
              </Paper>
            </>
          )}
          {conflicts && (
            <>
              <Typography variant="h6">Conflicts:</Typography>
              <Paper variant="outlined" className={classes.contentColumn}>
                <Typography variant="body1">
                  {conflicts.split(', ').map((b, i, conflictsSplitted) => {
                    const [conflictName, ...rest] = b.split(' ')
                    return (
                      <>
                        <Link
                          component="button"
                          variant="body1"
                          key={`${name}-conflicts-${b}`}
                          onClick={() => push(`/package/${conflictName}`)}
                        >
                          {conflictName}
                        </Link>
                        {' ' + rest.join('')}
                        {i !== conflictsSplitted.length - 1 && ', '}
                      </>
                    )
                  })}
                </Typography>
              </Paper>
            </>
          )}
          {suggests && (
            <>
              <Typography variant="h6">Suggests:</Typography>
              <Paper variant="outlined" className={classes.contentColumn}>
                <Typography variant="body1">
                  {suggests.split(', ').map((b, i, suggestsSplitted) => {
                    const [suggestedName, ...rest] = b.split(' ')
                    return (
                      <>
                        <Link
                          component="button"
                          variant="body1"
                          key={`${name}-suggests-${b}`}
                          onClick={() => push(`/package/${suggestedName}`)}
                        >
                          {suggestedName}
                        </Link>
                        {' ' + rest.join('')}
                        {i !== suggestsSplitted.length - 1 && ', '}
                      </>
                    )
                  })}
                </Typography>
              </Paper>
            </>
          )}
          {replaces && (
            <>
              <Typography variant="h6">Replaces:</Typography>
              <Paper variant="outlined" className={classes.contentColumn}>
                <Typography variant="body1">
                  {replaces.split(', ').map((b, i, replacesSplitted) => {
                    const [replaceName, ...rest] = b.split(' ')
                    return (
                      <>
                        <Link
                          component="button"
                          variant="body1"
                          key={`${name}-replaces-${b}`}
                          onClick={() => push(`/package/${replaceName}`)}
                        >
                          {replaceName}
                        </Link>
                        {' ' + rest.join('')}
                        {i !== replacesSplitted.length - 1 && ', '}
                      </>
                    )
                  })}
                </Typography>
              </Paper>
            </>
          )}
          {provides && (
            <>
              <Typography variant="h6">Provides:</Typography>
              <Paper variant="outlined" className={classes.contentColumn}>
                <Typography variant="body1">
                  {provides.split(', ').map((b, i) => {
                    const [provideName, ...rest] = b.split(' ')
                    return (
                      <>
                        <Link
                          component="button"
                          variant="body1"
                          key={`${name}-provides-${b}`}
                          onClick={() => push(`/package/${provideName}`)}
                        >
                          {provideName}
                        </Link>
                        {' ' + rest.join('')}
                        {i !== provides?.length - 1 && ', '}
                      </>
                    )
                  })}
                </Typography>
              </Paper>
            </>
          )}
          {Object.keys(rest).length !== 0 &&
            Object.keys(rest).map(prop => {
              type PackageOptionalFields = Exclude<Package, typeof pkgRegex.required>
              const key = prop as keyof PackageOptionalFields
              const additionalInfo = rest as PackageOptionalFields
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
      <ExpansionPanelActions>
        {loading && <CircularProgress disableShrink />}
        {upgradable &&
          (queuedUpgrade ? (
            <Button
              variant="outlined"
              disabled={queuedUpgrade && isBusy}
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
              disabled={queuedUpgrade && isBusy}
              color="primary"
              className={cls(classes.button, classes.upgrade)}
              size="large"
              onClick={() => {
                enqueueSnackbar(`Package ${name}@${version} queued for upgrade`, {
                  variant: 'info'
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
            disabled={queuedUpgrade && isBusy}
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
            disabled={queuedUpgrade && isBusy}
            color="primary"
            className={cls(classes.button, classes.install)}
            size="large"
            onClick={() => {
              enqueueSnackbar(
                packages.find((el: QueueNode) => el.name === name)
                  ? `Package ${name}@${version} dequeued`
                  : `Package ${name}@${version} queued for installation`,
                {
                  variant: 'success'
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
    </Paper>
  ) : (
    <PackageInfoSkeleton />
  )
}

export default connector(withRouter(PackageInfo))
