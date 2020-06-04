import {
  ExpansionPanel,
  ExpansionPanelActions,
  ExpansionPanelDetails,
  ExpansionPanelSummary,
  makeStyles,
  Paper,
  Typography
} from '@material-ui/core'
import { Skeleton } from '@material-ui/lab'
import React from 'react'
import { ExpandMore } from '@material-ui/icons'

const useStyles = makeStyles(theme => ({
  root: {
    margin: theme.spacing(4),
    padding: theme.spacing(4)
  },
  nameContainer: {
    display: 'flex',
    alignItems: 'center',
    marginTop: theme.spacing(2),
    padding: theme.spacing(2)
  },
  panel: {
    marginTop: theme.spacing(2)
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '150px auto',
    gridGap: theme.spacing(2),
    alignItems: 'center',
    whiteSpace: 'pre-wrap',
    marginTop: theme.spacing(1),
    padding: theme.spacing(2)
  },
  contentColumn: {
    padding: theme.spacing(1)
  },
  media: {
    marginRight: theme.spacing(2)
  },
  label: {
    marginTop: theme.spacing(4)
  },
  button: {
    marginTop: theme.spacing(3),
    marginLeft: 'auto'
  }
}))

const PackageInfoSkeleton = () => {
  const classes = useStyles()
  return (
    <Paper elevation={8} className={classes.root}>
      <Paper className={classes.nameContainer} elevation={10}>
        <Skeleton height={60} width={60} className={classes.media} variant="rect" />
        <Skeleton width={250} variant="rect" />
      </Paper>
      <ExpansionPanel disabled={true} className={classes.panel} defaultExpanded>
        <ExpansionPanelSummary
          expandIcon={<ExpandMore />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography variant="h5">General info</Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails className={classes.grid}>
          <Typography variant="h6">Version:</Typography>
          <Skeleton variant="rect" className={classes.contentColumn} />
          <Typography variant="h6">Maintainer:</Typography>
          <Skeleton variant="rect" className={classes.contentColumn} />
          <Typography variant="h6">Description:</Typography>
          <Skeleton variant="rect" height={200} className={classes.contentColumn} />
        </ExpansionPanelDetails>
      </ExpansionPanel>
      <ExpansionPanel disabled={true}>
        <ExpansionPanelSummary
          expandIcon={<ExpandMore />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography variant="h5">Additional info</Typography>
        </ExpansionPanelSummary>
      </ExpansionPanel>
      <ExpansionPanel disabled={true}>
        <ExpansionPanelSummary
          expandIcon={<ExpandMore />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography variant="h5">Screenshots</Typography>
        </ExpansionPanelSummary>
      </ExpansionPanel>
      <ExpansionPanelActions>
        <Skeleton variant="rect" height={35} width={90} />
      </ExpansionPanelActions>
    </Paper>
  )
}

export default PackageInfoSkeleton
