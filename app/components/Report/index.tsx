import {
  Button,
  Card,
  CardActions,
  CardContent,
  Divider,
  Grid,
  makeStyles,
  Paper,
  Typography
} from '@material-ui/core'
import { Report as ReportIcon } from '@material-ui/icons'
import React, { useState } from 'react'
import { ReportInfo } from '../../actions/reviews'
import { red } from '@material-ui/core/colors'
import ReviewDialog from '../ReviewDialog'
import { useTranslation } from 'react-i18next'
import cls from 'classnames'

const useStyles = makeStyles(theme => ({
  card: {
    width: '80vw'
  },
  description: {
    whiteSpace: 'pre-wrap',
    paddingTop: theme.spacing(2)
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
  buttonsHolder: {
    justifyContent: 'flex-end'
  },
  name: {
    paddingLeft: theme.spacing(1)
  },
  reportedUser: {
    color: red[500]
  },
  ban: {
    color: '#f44336',
    borderColor: '#f44336'
  },
  reviewed: {
    opacity: 0.5
  }
}))

type ReportProps = {
  report: ReportInfo
  id: number
  destroyReviewComponent: (id: number) => void
}

const Report = ({
  report: {
    date,
    packageName,
    reportedUser,
    commentary,
    reportedBy,
    reviewed,
    review,
    reviewedBy,
    reviewedDate
  },
  id,
  destroyReviewComponent
}: ReportProps) => {
  const classes = useStyles()
  const [showReviewDialog, setShowReviewDialog] = useState(false)
  const { t } = useTranslation()
  return (
    <>
      <Grid item>
        <Card className={cls(classes.card, reviewed && classes.reviewed)}>
          <CardContent>
            <Paper className={classes.header} elevation={10}>
              <div className={classes.nameHolder}>
                <ReportIcon />
                <Typography className={classes.name} variant="h5">
                  {packageName}
                </Typography>
                <div style={{ marginLeft: 'auto' }}>
                  <Typography className={classes.reportedUser} variant="h5">
                    Reported User: {reportedUser}
                  </Typography>
                  <Typography className={classes.reportedUser} variant="h5">
                    Date: {new Date(date * 1000).toLocaleString()}
                  </Typography>
                  <Typography variant="h5">
                    {t('reportedBy')}: {reportedBy}
                  </Typography>
                </div>
              </div>
            </Paper>
            <Typography
              className={classes.description}
              variant="body1"
              color="textSecondary"
              component="p"
              noWrap
            >
              <>
                Commentary: {commentary}
                {reviewed && (
                  <>
                    <Divider />
                    Review: {review}
                  </>
                )}
              </>
            </Typography>
          </CardContent>
          <CardActions className={classes.buttonsHolder}>
            <Button
              variant="outlined"
              disabled={reviewed}
              size="medium"
              onClick={() => setShowReviewDialog(true)}
            >
              {t('review')}
            </Button>
          </CardActions>
        </Card>
      </Grid>
      {showReviewDialog && !reviewed && (
        <ReviewDialog
          report={{
            packageName,
            reportedUser,
            reportedBy,
            date,
            reviewed,
            commentary,
            review,
            reviewedBy,
            reviewedDate
          }}
          onClose={() => {
            setShowReviewDialog(false)
          }}
          onSubmit={() => {
            destroyReviewComponent(id)
          }}
        />
      )}
    </>
  )
}

export default Report
