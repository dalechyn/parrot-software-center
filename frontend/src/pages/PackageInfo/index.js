import React from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import {
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  Container,
  Chip,
  Divider,
  Grid,
  Paper,
  Typography,
  makeStyles
} from '@material-ui/core'
import { ArrowBack } from '@material-ui/icons'
import { green, blue } from '@material-ui/core/colors'

const useStyles = makeStyles(theme => ({
  root: {
    margin: theme.spacing(4),
    padding: theme.spacing(4)
  },
  nameContainer: {
    marginTop: theme.spacing(2),
    backgroundColor: blue[300],
    width: 'min-content',
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

const PackageInfo = () => {
  const history = useHistory()
  const {
    state: { name, description, version, maintainer }
  } = useLocation()

  const classes = useStyles()

  return (
    <Paper elevation={8} className={classes.root}>
      <Button size='large' startIcon={<ArrowBack />} onClick={() => history.goBack()}>
        Go Back
      </Button>
      <Paper variant='outlined' className={classes.nameContainer}>
        <Typography className={classes.hack} variant='h3'>
          {name}
        </Typography>
      </Paper>
      <Paper className={classes.grid}>
        <Typography variant='h5'>Version:</Typography>
        <Paper variant='outlined' className={classes.contentColumn}>
          <Typography variant='h5'>{version}</Typography>
        </Paper>
        <Typography variant='h5'>Description:</Typography>
        <Paper variant='outlined' className={classes.contentColumn}>
          <Typography variant='h5'>{description}</Typography>
        </Paper>
        <Typography variant='h5'>Maintainer:</Typography>
        <Paper variant='outlined' className={classes.contentColumn}>
          <Typography variant='h5'>{maintainer}</Typography>
        </Paper>
      </Paper>
    </Paper>
  )
}

export default PackageInfo
