import React, { useState } from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'

import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Img from 'react-image'
import { push } from 'connected-react-router'
import { useSnackbar } from 'notistack'

import {
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  Chip,
  Paper,
  Typography,
  makeStyles
} from '@material-ui/core'
import { grey, red, orange } from '@material-ui/core/colors'
import dummyPackageImg from '../../assets/package.png'
import { queueActions } from '../../actions'

const maxDescriptionLength = 500

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
    display: 'inline-grid',
    gridTemplateColumns: 'auto auto auto auto',
    alignItems: 'center',
    gridGap: theme.spacing(1),
    paddingTop: theme.spacing(1),
    marginLeft: 'auto'
  },
  buttons: {
    justifyContent: 'flex-end'
  },
  cveCritical: {
    background: red[500]
  },
  cveImportant: {
    background: orange[500]
  },
  name: {
    paddingLeft: theme.spacing(1)
  },
  chipText: {
    color: grey[900]
  }
}))

const PackagePreview = ({
  imageUrl,
  name,
  description,
  version,
  push,
  install,
  uninstall,
  queue,
  cveInfo,
  installed,
  ...rest
}) => {
  const [installedOrQueried, setInstalled] = useState(installed)
  const { enqueueSnackbar } = useSnackbar()
  const classes = useStyles()
  return (
    <Card className={classes.root}>
      <CardActionArea
        onClick={() =>
          push({
            pathname: '/package',
            state: {
              data: { name, version, description, installed, imageUrl, ...rest }
            }
          })
        }
      >
        <CardContent>
          <Paper className={classes.header} elevation={10}>
            <div className={classes.nameHolder}>
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
              <Typography className={classes.name} variant='h5'>
                {name}
              </Typography>
            </div>
            <div className={classes.cve}>
              <Chip label={'This month CVEs:'} />
              <Chip
                className={classnames(classes.cveCritical, classes.chipText)}
                label={`Critical: ${cveInfo.critical}`}
              />
              <Chip
                className={classnames(classes.cveImportant, classes.chipText)}
                label={`Important: ${cveInfo.important}`}
              />
              <Chip label={`Low: ${cveInfo.low}`} />
            </div>
          </Paper>
          <Typography
            className={classes.description}
            variant='body1'
            color='textSecondary'
            component='p'
            noWrap
          >
            {description.slice(0, maxDescriptionLength) + '...'}
          </Typography>
        </CardContent>
      </CardActionArea>
      <CardActions className={classes.buttons}>
        {installedOrQueried ? (
          <Button
            onClick={() => {
              enqueueSnackbar(
                queue.find(el => el.name === name && el.version === version)
                  ? `Package ${name}@${version} dequeued`
                  : `Package ${name}@${version} queued for deletion`,
                {
                  variant: 'error'
                }
              )
              uninstall(name, version)
              setInstalled(false)
            }}
            variant='outlined'
            size='medium'
            color='secondary'
          >
            Uninstall
          </Button>
        ) : (
          <Button
            onClick={() => {
              enqueueSnackbar(
                queue.find(el => el.name === name && el.version === version)
                  ? `Package ${name}@${version} dequeued`
                  : `Package ${name}@${version} queued for installation`,
                {
                  variant: 'success'
                }
              )
              install(name, version)
              setInstalled(true)
            }}
            variant='outlined'
            size='medium'
            color='primary'
          >
            Install
          </Button>
        )}
      </CardActions>
    </Card>
  )
}

if (process.env.node_env === 'development') {
  PackagePreview.propTypes = {
    imageUrl: PropTypes.string,
    name: PropTypes.string.isRequired,
    version: PropTypes.string.isRequired,
    description: PropTypes.string,
    push: PropTypes.func,
    install: PropTypes.func.isRequired,
    installed: PropTypes.bool,
    uninstall: PropTypes.func,
    queue: PropTypes.array,
    cveInfo: PropTypes.shape({
      critical: PropTypes.number,
      important: PropTypes.number,
      low: PropTypes.number
    }).isRequired
  }
}

const mapStateToProps = ({ queue }) => ({ queue })

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      push,
      install: queueActions.queue,
      uninstall: queueActions.dequeue
    },
    dispatch
  )

export default connect(mapStateToProps, mapDispatchToProps)(PackagePreview)
