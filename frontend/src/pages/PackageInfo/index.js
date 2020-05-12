import React from 'react'
import PropTypes from 'prop-types'

import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { goBack } from 'connected-react-router'

import {
  Button,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
  Paper,
  Typography,
  makeStyles
} from '@material-ui/core'
import { ArrowBack, ExpandMore } from '@material-ui/icons'
import { blue, green } from '@material-ui/core/colors'
import dummyPackageImg from '../../assets/package.png'
import Img from 'react-image'

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
    marginLeft: theme.spacing(2),
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
    marginTop: theme.spacing(3)
  }
}))

const PackageInfo = ({
  name,
  description,
  version,
  maintainer,
  installed,
  imageUrl,
  goBack,
  ...rest
}) => {
  const classes = useStyles()
  return (
    <Paper elevation={8} className={classes.root}>
      <Button size='large' startIcon={<ArrowBack />} onClick={() => goBack()}>
        Go Back
      </Button>
      <Paper className={classes.nameContainer} elevation={10}>
        <Img
          className={classes.media}
          src={imageUrl}
          unloader={
            <img
              className={classes.media}
              src={dummyPackageImg}
              alt={'No Package Found'}
            />
          }
        />
        <Typography style={{ color: green[400] }} variant='h5'>
          {name}
        </Typography>
        <Typography variant='h5'>@</Typography>
        <Typography style={{ color: blue[400] }} variant='h5'>
          {version}
        </Typography>
      </Paper>
      <ExpansionPanel className={classes.panel} defaultExpanded>
        <ExpansionPanelSummary
          expandIcon={<ExpandMore />}
          aria-controls='panel1a-content'
          id='panel1a-header'
        >
          <Typography variant='h5'>General info</Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails className={classes.grid}>
          <Typography variant='h6'>Version:</Typography>
          <Paper variant='outlined' className={classes.contentColumn}>
            <Typography variant='body1'>{version}</Typography>
          </Paper>
          <Typography variant='h6'>Maintainer:</Typography>
          <Paper variant='outlined' className={classes.contentColumn}>
            <Typography variant='body1'>{maintainer}</Typography>
          </Paper>
          <Typography variant='h6'>Description:</Typography>
          <Paper variant='outlined' className={classes.contentColumn}>
            <Typography variant='body1'>{description}</Typography>
          </Paper>
        </ExpansionPanelDetails>
      </ExpansionPanel>
      <ExpansionPanel disabled={Object.keys(rest).length === 0}>
        <ExpansionPanelSummary
          expandIcon={<ExpandMore />}
          aria-controls='panel1a-content'
          id='panel1a-header'
        >
          <Typography variant='h5'>Additional info</Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails className={classes.grid}>
          {Object.keys(rest).map(key => (
            <div key={`${name}@${version}@${key}`}>
              <Typography variant='h6'>
                key.charAt(0).toUpperCase() + key.slice(1)
              </Typography>
              <Paper variant='outlined' className={classes.contentColumn}>
                <Typography variant='body1'>{rest[key]}</Typography>
              </Paper>
            </div>
          ))}
        </ExpansionPanelDetails>
      </ExpansionPanel>
      <ExpansionPanel>
        <ExpansionPanelSummary
          expandIcon={<ExpandMore />}
          aria-controls='panel1a-content'
          id='panel1a-header'
        >
          <Typography variant='h5'>Screenshots</Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails className={classes.grid}>
          Screenshots should be here!
        </ExpansionPanelDetails>
      </ExpansionPanel>
      {installed ? (
        <Button variant='outlined' className={classes.button} size='large'>
          Uninstall
        </Button>
      ) : (
        <Button
          variant='outlined'
          color='primary'
          className={classes.button}
          size='large'
        >
          Install
        </Button>
      )}
    </Paper>
  )
}

if (process.env.node_env === 'development') {
  PackageInfo.propTypes = {
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    version: PropTypes.string.isRequired,
    maintainer: PropTypes.string.isRequired,
    goBack: PropTypes.func
  }
}

const mapStateToProps = ({
  router: {
    location: {
      state: { data }
    }
  }
}) => data

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      goBack
    },
    dispatch
  )

export default connect(mapStateToProps, mapDispatchToProps)(PackageInfo)
