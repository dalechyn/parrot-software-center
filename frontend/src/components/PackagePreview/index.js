import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'

import { bindActionCreators } from 'redux'
import { queueActions } from '../../actions'
import { connect } from 'react-redux'
import { push } from 'connected-react-router'
import { useSnackbar } from 'notistack'

import classnames from 'classnames'
import Img from 'react-image'
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

const cveAPIInfo = {
  api: 'http://cve.circl.lu/api/search/',
  handleResult: json => json
}

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
  version,
  description,
  push,
  install,
  uninstall,
  queue,
  ...rest
}) => {
  const [installed, setInstalled] = useState(false)
  const [cveInfo, setCVEInfo] = useState({})
  const [cveLoaded, setCVELoaded] = useState(false)
  const { enqueueSnackbar } = useSnackbar()

  useEffect(() => {
    // Commented until cve-search#420 resolves.
    // If it won't resolve though, I will have to cache results on the backend :/
    /* const f = async () => {
      const currentDate = new Date()
      currentDate.setMonth(currentDate.getMonth() - 1)

      const requestURL = new URL(`${name}`, cveAPI).toString()

      return await fetch(requestURL, {
        method: 'GET',
        // mode: 'no-cors',
        headers: {
          Accept: 'application/json',
          'User-Agent': ' ',
          'Accept-Language': ' '
        }
      })
    }

    f().then(json => {
      setCVEInfo(json)
      setCVELoaded(true)
    }) */

    const f = async () => {
      setInstalled(await window.dpkgQuery(name))
    }

    f()

    setCVEInfo(cveAPIInfo.handleResult({ critical: 3, important: 41, low: 412 }))
    setCVELoaded(true)
  }, [name])

  const classes = useStyles()
  return (
    <Card className={classes.root}>
      <CardActionArea
        onClick={() =>
          push({
            pathname: '/package',
            state: { name, description, ...rest }
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

            {cveLoaded && (
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
            )}
          </Paper>
          <Typography
            className={classes.description}
            variant='body1'
            color='textSecondary'
            component={'p'}
            noWrap
          >
            {description.slice(0, maxDescriptionLength) + '...'}
          </Typography>
        </CardContent>
      </CardActionArea>
      <CardActions className={classes.buttons}>
        {installed ? (
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
    name: PropTypes.string,
    version: PropTypes.string,
    description: PropTypes.string,
    push: PropTypes.func,
    install: PropTypes.func,
    uninstall: PropTypes.func,
    queue: PropTypes.array
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

export { default as SearchSkeleton } from './skeleton'
export default connect(mapStateToProps, mapDispatchToProps)(PackagePreview)
