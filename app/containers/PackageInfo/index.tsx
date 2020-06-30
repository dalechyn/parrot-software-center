import React, { Fragment, useEffect, useState } from 'react'

import { connect, ConnectedProps } from 'react-redux'
import { goBack } from 'connected-react-router'

import {
  Button,
  ExpansionPanel,
  ExpansionPanelActions,
  ExpansionPanelDetails,
  ExpansionPanelSummary,
  makeStyles,
  Paper,
  Typography
} from '@material-ui/core'
import { ArrowBack, ExpandMore } from '@material-ui/icons'
import { blue, green } from '@material-ui/core/colors'
import dummyPackageImg from '../../assets/package.png'
import { Img } from 'react-image'
import { useSnackbar } from 'notistack'
import { AptActions, QueueActions } from '../../actions'
import { unwrapResult } from '@reduxjs/toolkit'
import PackageInfoSkeleton from './skeleton'
import { QueueNode } from '../Queue'

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
  queue: { packages }
}: RootState) => ({ ...state, packages })

const mapDispatchToProps = {
  goBack,
  install: QueueActions.install,
  uninstall: QueueActions.uninstall,
  search: AptActions.search
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
type PackageInfoProps = ConnectedProps<typeof connector> & {
  name: string
  imageUrl: string
  installed: boolean
}

const PackageInfo = ({
  name,
  imageUrl,
  goBack,
  packages,
  install,
  uninstall,
  search,
  installed
}: PackageInfoProps) => {
  if (!name) return null
  const classes = useStyles()
  const [installedOrQueried, setInstalled] = useState(installed)
  const [packageInfo, setPackageInfo] = useState({} as Package)
  useEffect(() => {
    const f = async () => {
      const queuePackage = packages.find((pkg: QueueNode) => name === pkg.name)
      if (queuePackage) setInstalled(!!queuePackage?.flag)
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
      setPackageInfo(newPackage)
    }
    f()
  }, [])
  const { enqueueSnackbar } = useSnackbar()
  const { version, maintainer, description, ...rest } = packageInfo
  return packageInfo ? (
    <Paper elevation={8} className={classes.root}>
      <Button size="large" startIcon={<ArrowBack />} onClick={() => goBack()}>
        Go Back
      </Button>
      <Paper className={classes.nameContainer} elevation={10}>
        <Img
          className={classes.media}
          src={imageUrl}
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
        <ExpansionPanelSummary
          expandIcon={<ExpandMore />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
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
        <ExpansionPanelSummary
          expandIcon={<ExpandMore />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography variant="h5">Additional info</Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails className={classes.grid}>
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
      <ExpansionPanel>
        <ExpansionPanelSummary
          expandIcon={<ExpandMore />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography variant="h5">Screenshots</Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails className={classes.grid}>
          Screenshots should be here!
        </ExpansionPanelDetails>
      </ExpansionPanel>
      <ExpansionPanelActions>
        {installedOrQueried ? (
          <Button
            variant="outlined"
            className={classes.button}
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
            color="primary"
            className={classes.button}
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

export default connector(PackageInfo)
