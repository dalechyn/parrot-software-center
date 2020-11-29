import React, { useEffect, useState } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { makeStyles, Grid, CircularProgress } from '@material-ui/core'
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
  const [loading, setLoading] = useState(true)
  const classes = useStyles()
  useEffect(() => {
    ;(async () => {
      const newReports = await getReports()
      setLoading(false)
      console.log(newReports)
      setReports(unwrapResult(newReports))
    })()
  }, [])

  const destroyReportComponent = (id: number) => {
    // Immutability is first
    const newReports = [...reports.slice(0, id), ...reports.slice(id + 1)]
    setReports(newReports)
  }

  return (
    <section className={classes.root}>
      <Grid container direction="column" justify="space-evenly" alignItems="center" spacing={2}>
        {loading ? (
          <CircularProgress />
        ) : (
          reports.map((report, i) => (
            <Report
              id={i}
              destroyReviewComponent={destroyReportComponent}
              report={report}
              key={`report-${i}`}
            />
          ))
        )}
      </Grid>
    </section>
  )
}

export default connector(Reports)
