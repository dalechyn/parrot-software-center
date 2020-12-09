import {
  Button,
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
import { ArrowBack, ExpandMore } from '@material-ui/icons'
import { goBack } from 'connected-react-router'
import { connect, ConnectedProps } from 'react-redux'
import { withRouter } from 'react-router'
import { RouteComponentProps } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

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

const mapDispatchToProps = {
  goBack
}

const connector = connect(null, mapDispatchToProps)

type PackageInfoSkeletonProps = ConnectedProps<typeof connector> & RouteComponentProps

const PackageInfoSkeleton = ({ goBack }: PackageInfoSkeletonProps) => {
  const classes = useStyles()
  const { t } = useTranslation();
  return (
    <Paper elevation={8} className={classes.root}>
      <Button size="large" startIcon={<ArrowBack />} onClick={() => goBack()}>
        {t('goback')}
      </Button>
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
          <Typography variant="h5">{t('generalInfo')}</Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails className={classes.grid}>
          <Typography variant="h6">{t('version')}:</Typography>
          <Skeleton variant="rect" className={classes.contentColumn} />
          <Typography variant="h6">{t('mantainer')}:</Typography>
          <Skeleton variant="rect" className={classes.contentColumn} />
          <Typography variant="h6">{t('description')}:</Typography>
          <Skeleton variant="rect" height={200} className={classes.contentColumn} />
        </ExpansionPanelDetails>
      </ExpansionPanel>
      <ExpansionPanel disabled={true}>
        <ExpansionPanelSummary
          expandIcon={<ExpandMore />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography variant="h5">{t('additionalInfo')}</Typography>
        </ExpansionPanelSummary>
      </ExpansionPanel>
      <ExpansionPanel disabled={true}>
        <ExpansionPanelSummary
          expandIcon={<ExpandMore />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography variant="h5">{t('screenshots')}</Typography>
        </ExpansionPanelSummary>
      </ExpansionPanel>
      <ExpansionPanelActions>
        <Skeleton variant="rect" height={35} width={90} />
      </ExpansionPanelActions>
    </Paper>
  )
}

export default connector(withRouter(PackageInfoSkeleton))
