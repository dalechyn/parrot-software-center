import React from 'react'
import { Grid, makeStyles } from '@material-ui/core'
import UpgradeForm from '../../components/UpgradeForm'

const useStyles = makeStyles(theme => ({
  padded: {
    padding: theme.spacing(2)
  }
}))

const Home = () => {
  const classes = useStyles()
  return (
    <Grid container direction="column" alignItems="center" className={classes.padded}>
      <UpgradeForm />
    </Grid>
  )
}

export default Home
