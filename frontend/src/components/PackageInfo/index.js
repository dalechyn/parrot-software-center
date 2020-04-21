import {
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  Typography
} from '@material-ui/core'
import Img from 'react-image'
import dummyPackageImg from '../../assets/package.png'
import React from 'react'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(theme => ({
  root: {
    maxWidth: '80vw'
  },
  media: {
    height: 40,
    width: 40,
    verticalAlign: 'middle'
  },
  nameHolder: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(2)
  },
  name: {
    paddingLeft: theme.spacing(1)
  }
}))

const PackageInfo = ({ imageUrl, name, description }) => {
  const classes = useStyles()
  return (
    <Card className={classes.root}>
      <CardActionArea>
        <CardContent>
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
          <Typography
            variant='body1'
            color='textSecondary'
            style={{ whitespace: 'pre-wrap' }}
            component={'span'}
          >
            {description}
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

export default PackageInfo
