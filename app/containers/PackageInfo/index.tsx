import React, { Fragment, useEffect, useState } from 'react'

import { connect, ConnectedProps } from 'react-redux'
import { goBack } from 'connected-react-router'

import {
  Button,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
  ExpansionPanelActions,
  Paper,
  Typography,
  makeStyles
} from '@material-ui/core'
import { ArrowBack, ExpandMore } from '@material-ui/icons'
import { blue, green } from '@material-ui/core/colors'
import dummyPackageImg from '../../assets/package.png'
import { Img } from 'react-image'
import { useSnackbar } from 'notistack'
import { QueueActions } from '../../actions'
import { Package } from '../SearchResults/fetch'
import { QueueNode } from '../../store/reducers/queue'

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

const mapStateToProps = ({
  router: {
    location: {
      state: { data }
    }
  },
  queue
}: RootState) => ({ ...data, queue })

const mapDispatchToProps = {
  goBack,
  install: QueueActions.install,
  uninstall: QueueActions.uninstall
}

const connector = connect(mapStateToProps, mapDispatchToProps)

type PackageInfoProps = ConnectedProps<typeof connector> &
  Package & {
    imageUrl: string
    installed: boolean
  }

const PackageInfo = ({
  name,
  description,
  version,
  maintainer,
  installed,
  imageUrl,
  goBack,
  queue,
  install,
  uninstall,
  ...rest
}: PackageInfoProps) => {
  const classes = useStyles()
  const [installedOrQueried, setInstalled] = useState(installed)
  useEffect(() => {
    const queuePackage = queue.find(
      (pkg: QueueNode) => name === pkg.name && version === pkg.version
    )
    if (queuePackage) setInstalled(!!queuePackage?.flag)
  }, [])
  const { enqueueSnackbar } = useSnackbar()
  return (
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
      <ExpansionPanel className={classes.panel} defaultExpanded>
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
            <Typography variant="body1">{description}</Typography>
          </Paper>
        </ExpansionPanelDetails>
      </ExpansionPanel>
      <ExpansionPanel disabled={Object.keys(rest).length === 0}>
        <ExpansionPanelSummary
          expandIcon={<ExpandMore />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography variant="h5">Additional info</Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails className={classes.grid}>
          {Object.keys(rest).map(key => (
            <Fragment key={`${name}@${version}@${key}`}>
              <Typography style={{ width: 'min-content' }} variant="h6">
                {key.charAt(0).toUpperCase() + key.slice(1)}:
              </Typography>
              <Paper variant="outlined" className={classes.contentColumn}>
                <Typography variant="body1">{rest[key]}</Typography>
              </Paper>
            </Fragment>
          ))}
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
                queue.find((el: QueueNode) => el.name === name && el.version === version)
                  ? `Package ${name}@${version} dequeued`
                  : `Package ${name}@${version} queued for deletion`,
                {
                  variant: 'error'
                }
              )
              uninstall({ name, version })
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
                queue.find((el: QueueNode) => el.name === name && el.version === version)
                  ? `Package ${name}@${version} dequeued`
                  : `Package ${name}@${version} queued for installation`,
                {
                  variant: 'success'
                }
              )
              install({ name, version })
              setInstalled(true)
            }}
          >
            Install
          </Button>
        )}
      </ExpansionPanelActions>
    </Paper>
  )
}

export default connector(PackageInfo)
