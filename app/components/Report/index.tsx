import {
  Button,
  Card,
  CardActions,
  CardContent,
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
  }
}))

type ReportProps = {
  report: ReportInfo
  id: number
  destroyReviewComponent: (id: number) => void
}

const Report = ({ report, id, destroyReviewComponent }: ReportProps) => {
  const classes = useStyles()
  const [showReviewDialog, setShowReviewDialog] = useState(false)
  return (
    <>
      <Grid item>
        <Card className={classes.card}>
          <CardContent>
            <Paper className={classes.header} elevation={10}>
              <div className={classes.nameHolder}>
                <ReportIcon />
                <Typography className={classes.name} variant="h5">
                  {report.packageName}
                </Typography>
                <div style={{ marginLeft: 'auto' }}>
                  <Typography className={classes.reportedUser} variant="h5">
                    {report.reportedUser}
                  </Typography>
                  <Typography variant="h5">Reported by: {report.reportedBy}</Typography>
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
              {report.commentary}
            </Typography>
          </CardContent>
          <CardActions className={classes.buttonsHolder}>
            <Button variant="outlined" size="medium" onClick={() => setShowReviewDialog(true)}>
              Review
            </Button>
          </CardActions>
        </Card>
      </Grid>
      {showReviewDialog && (
        <ReviewDialog
          report={report}
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
