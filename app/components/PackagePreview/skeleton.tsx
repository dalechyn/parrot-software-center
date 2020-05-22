import React from 'react'
import {
  Box,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  makeStyles,
  Paper
} from '@material-ui/core'
import { Skeleton } from '@material-ui/lab'

const useStyles = makeStyles(theme => ({
  root: {
    width: '80vw'
  },
  description: {
    display: 'grid',
    paddingTop: theme.spacing(2),
    gridGap: '10px'
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
  name: {
    marginLeft: theme.spacing(1),
    width: '50vw'
  },
  chip: {
    width: 100
  }
}))

const SearchSkeleton = () => {
  const classes = useStyles()
  return (
    <Card className={classes.root}>
      <CardActionArea disabled>
        <CardContent>
          <Paper className={classes.header} elevation={10}>
            <div className={classes.nameHolder}>
              <Skeleton className={classes.media} variant="circle" />
              <Skeleton className={classes.name} variant="rect" />
            </div>
            <div className={classes.cve}>
              <Skeleton className={classes.chip} variant="rect" />
              <Skeleton className={classes.chip} variant="rect" />
              <Skeleton className={classes.chip} variant="rect" />
              <Skeleton className={classes.chip} variant="rect" />
            </div>
          </Paper>
          <Box className={classes.description}>
            <Skeleton variant="rect" width="75%" />
            <Skeleton variant="rect" width="100%" />
            <Skeleton variant="rect" width="95%" />
            <Skeleton variant="rect" width="30%" />
          </Box>
        </CardContent>
      </CardActionArea>
      <CardActions className={classes.buttons}>
        <Skeleton variant="rect" height={35} width={90} />
      </CardActions>
    </Card>
  )
}

export default SearchSkeleton
