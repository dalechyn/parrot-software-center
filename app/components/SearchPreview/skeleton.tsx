import React from 'react'
import {
  Box,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  Grid,
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
  }
}))

const SearchSkeleton = () => {
  const classes = useStyles()
  return (
    <Grid item>
      <Card className={classes.root}>
        <CardActionArea disabled>
          <CardContent>
            <Paper className={classes.header} elevation={10}>
              <div className={classes.nameHolder}>
                <Skeleton height={40} width={40} variant="circle" />
                <Skeleton className={classes.name} variant="rect" />
              </div>
              <div className={classes.cve}>
                <Skeleton width={100} variant="rect" />
                <Skeleton width={100} variant="rect" />
                <Skeleton width={100} variant="rect" />
                <Skeleton width={100} variant="rect" />
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
    </Grid>
  )
}

export default SearchSkeleton
