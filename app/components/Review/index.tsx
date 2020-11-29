import React, { useState } from 'react'
import {
  CardContent,
  Card,
  Typography,
  CardHeader,
  Divider,
  Button,
  CardActions
} from '@material-ui/core'
import { Rating } from '@material-ui/lab'
import { connect, ConnectedProps } from 'react-redux'
import ReportDialog from '../ReportDialog'
import { deleteReview } from '../../actions/reviews'

const mapDispatchToProps = {
  deleteReview
}

const connector = connect(null, mapDispatchToProps)

type ReviewProps = ConnectedProps<typeof connector> & {
  packageName: string
  author: string
  commentary: string
  rating: number
  role: string
  id: number
  destroyReviewComponent: (id: number) => void
}

const Review = ({
  id,
  packageName,
  author,
  rating,
  commentary,
  role,
  deleteReview,
  destroyReviewComponent
}: ReviewProps) => {
  const [reportReviewShow, setReportReviewShow] = useState(false)
  return (
    <>
      <Card style={{ width: '100%' }}>
        <CardHeader
          title={author}
          subheader={<Rating style={{ marginLeft: 'auto' }} value={rating} readOnly />}
        />
        <Divider />
        <CardContent>
          <Typography>{commentary}</Typography>
        </CardContent>
        {role === 'moderator' && (
          <CardActions>
            <Button
              onClick={() =>
                (async () => {
                  await deleteReview({ author, packageName })
                  destroyReviewComponent(id)
                })()
              }
            >
              Delete
            </Button>
            <Button style={{ marginLeft: 'auto' }} onClick={() => setReportReviewShow(true)}>
              Report
            </Button>
          </CardActions>
        )}
      </Card>
      {reportReviewShow && (
        <ReportDialog
          name={packageName}
          onClose={() => setReportReviewShow(false)}
          reportedUser={author}
        />
      )}
    </>
  )
}

export default connector(Review)
