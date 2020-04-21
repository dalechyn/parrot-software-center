import {
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  Typography,
  Paper
} from '@material-ui/core'
import Img from 'react-image'
import dummyPackageImg from '../../assets/package.png'
import React, { useEffect, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'

const maxDescriptionLength = 200

const cveAPI = 'https://access.redhat.com/hydra/rest/securitydata/'

const useStyles = makeStyles(theme => ({
  root: {
    width: '80vw'
  },
  description: {
    whiteSpace: 'pre-wrap',
    paddingTop: theme.spacing(1)
  },
  media: {
    height: 40,
    width: 40,
    verticalAlign: 'middle'
  },
  nameHolder: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(1)
  },
  name: {
    paddingLeft: theme.spacing(1)
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
    const f = async () => {
      const currentDate = new Date()
      const cveRequestParams = {
        package: name,
        before: currentDate.setMonth(currentDate.getMonth() - 1)
      }

      const requestURL = new URL(
        'cve.json?' + new URLSearchParams(cveRequestParams).toString(),
        cveAPI
      ).toString()

      setCVEInfo(
        await fetch(requestURL, {
          method: 'GET',
          headers: {
            'Access-Control-Allow-Origin': 'http://localhost:3000'
          }
        })
      )
      setCVELoaded(true)
    }

    f()
  }, [])

  cveLoaded && console.log(cveInfo)
  const classes = useStyles()
  return (
    <Card className={classes.root}>
      <CardActionArea>
        <CardContent>
          <Paper className={classes.nameHolder} variant='outlined'>
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
      <CardActions>
        <Button size='small' color='primary'>
          Learn More
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
