import React from 'react'
import PropTypes from 'prop-types'

import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { goBack } from 'connected-react-router'

import { Button, Paper, Typography, makeStyles } from '@material-ui/core'
import { ArrowBack } from '@material-ui/icons'
import { blue } from '@material-ui/core/colors'

const useStyles = makeStyles(theme => ({
  root: {
    margin: theme.spacing(4),
    padding: theme.spacing(4)
  },
  nameContainer: {
    marginTop: theme.spacing(2),
    backgroundColor: blue[500],
    width: 'max-content',
    padding: theme.spacing(2),
    borderRadius: '25px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, auto)',
    gridGap: theme.spacing(2),
    gridAutoColumns: 'minmax(100px, auto)',
    alignItems: 'center',
    whiteSpace: 'pre-wrap',
    marginTop: theme.spacing(4),
    padding: theme.spacing(2)
  },
  contentColumn: {
    marginLeft: theme.spacing(2),
    padding: theme.spacing(1)
  }
}))

const PackageInfo = ({ name, description, version, maintainer, goBack }) => {
  const classes = useStyles()

  return (
    <Paper elevation={8} className={classes.root}>
      <Button size='large' startIcon={<ArrowBack />} onClick={() => goBack()}>
        Go Back
      </Button>
      <Paper variant='outlined' className={classes.nameContainer}>
        <Typography className={classes.hack} variant='h5'>
          {name}
        </Typography>
      </Paper>
      <Paper className={classes.grid}>
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
      </Paper>
    </Paper>
  )
}

PackageInfo.propTypes = {
  name: PropTypes.string,
  description: PropTypes.string,
  version: PropTypes.string,
  maintainer: PropTypes.string,
  goBack: PropTypes.func
}

const mapStateToProps = ({
  router: {
    location: {
      state: { name, description, version, maintainer }
    }
  }
}) => ({ name, description, version, maintainer })

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      goBack
    },
    dispatch
  )

export default connect(mapStateToProps, mapDispatchToProps)(PackageInfo)
