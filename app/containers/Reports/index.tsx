import React, { useEffect, useState } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { makeStyles, Grid, CircularProgress, Button } from '@material-ui/core'
import { ReviewsActions } from '../../actions'
import { ReportInfo } from '../../actions/reviews'
import { unwrapResult } from '@reduxjs/toolkit'
import Report from '../../components/Report'

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexFlow: 'column',
    padding: theme.spacing(3)
  }
}))

const mapDispatchToProps = {
  getReports: ReviewsActions.getReports
}

const connector = connect(null, mapDispatchToProps)

type ReportsProps = ConnectedProps<typeof connector>

const Reports = ({ getReports }: ReportsProps) => {
  const [reports, setReports] = useState(Array<ReportInfo>())
  const [showReviewed, setShowReviewed] = useState(false)
  const [loading, setLoading] = useState(true)
  const classes = useStyles()

  useEffect(() => {
    let active = true
    ;(async () => {
      setLoading(true)
      const newReports = await getReports(showReviewed)
      if (!active) return
      setLoading(false)
      setReports(unwrapResult(newReports))
      return () => {
        active = false
      }
    })()
  }, [showReviewed])

  const destroyReportComponent = (id: number) => {
    // Immutability is first
    const newReports = [...reports.slice(0, id), ...reports.slice(id + 1)]
    setReports(newReports)
  }

  return (
    <section className={classes.root}>
      <Grid container direction="column" justify="space-evenly" alignItems="center" spacing={2}>
        <Grid container justify="flex-start" style={{ width: '80vw' }}>
          <Button size="large" variant="outlined" onClick={() => setShowReviewed(!showReviewed)}>
            {showReviewed ? 'Hide Reviewed' : 'Show Reviewed'}
          </Button>
          <Button
            size="large"
            variant="contained"
            color="primary"
            style={{ marginLeft: '1rem' }}
            onClick={async () => {
              setLoading(true)
              const newReports = await getReports(showReviewed)
              setLoading(false)
              setReports(unwrapResult(newReports))
            }}
          >
            Refresh
          </Button>
          {loading && <CircularProgress />}
        </Grid>
        {!loading &&
          reports?.map((report, i) => (
            <Report
              id={i}
              destroyReviewComponent={destroyReportComponent}
              report={report}
              key={`report-${i}`}
            />
          ))}
      </Grid>
    </section>
  )
}

export default connector(Reports)
