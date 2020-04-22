import {
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  Chip,
  Paper,
  Typography
} from '@material-ui/core'
import { grey, red, orange } from '@material-ui/core/colors'
import Img from 'react-image'
import dummyPackageImg from '../../assets/package.png'
import React, { useEffect, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'
import classnames from 'classnames'

const maxDescriptionLength = 200

const cveAPIInfo = {
  api: 'http://cve.circl.lu/api/search/',
  handleResult: json => json
}

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
  nameHolder: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(1)
  },
  cve: {
    display: 'inline-grid',
    gridTemplateColumns: 'auto auto auto',
    gridGap: theme.spacing(1),
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

const processDescription = str => {
  const cleared = str.replace(/^ \./gm, '\n').replace(/^ /gm, '')
  const upperCased = cleared.charAt(0).toUpperCase() + cleared.slice(1)
  return upperCased.slice(0, maxDescriptionLength) + '...'
}

const PackageInfo = ({ imageUrl, name, description }) => {
  const [cveInfo, setCVEInfo] = useState({})
  const [cveLoaded, setCVELoaded] = useState(false)

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
    setCVEInfo(cveAPIInfo.handleResult({ critical: 3, important: 41, low: 412 }))
    setCVELoaded(true)
  }, [])

  const classes = useStyles()
  return (
    <Card className={classes.root}>
      <CardActionArea>
        <CardContent>
          <Paper className={classes.nameHolder} elevation={10}>
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
            {cveLoaded && (
              <div className={classes.cve}>
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
            {processDescription(description)}
          </Typography>
        </CardContent>
      </CardActionArea>
      <CardActions className={classes.buttons}>
        <Button variant='outlined' size='medium' color='primary'>
          Install
        </Button>
        <Button variant='outlined' size='medium' color='secondary'>
          Uninstall
        </Button>
      </CardActions>
    </Card>
  )
}

if (process.env.node_env === 'development') {
  PackageInfo.propTypes = {
    imageUrl: PropTypes.string,
    name: PropTypes.string,
    description: PropTypes.string
  }
}

export default PackageInfo
