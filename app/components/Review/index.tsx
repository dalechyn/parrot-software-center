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
import { deleteReview } from '../../actions/auth'

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
}

const Review = ({ packageName, author, rating, commentary, role, deleteReview }: ReviewProps) => {
  const [removed, setRemoved] = useState(false)
  return (
    <Card style={{ width: '100%' }}>
      <CardHeader
        title={author}
        subheader={<Rating style={{ marginLeft: 'auto' }} value={rating} readOnly />}
      />
      <Divider />
      <CardContent>
        <Typography>{removed ? 'REMOVED' : commentary}</Typography>
      </CardContent>
      {role === 'moderator' && (
        <CardActions>
          <Button
            onClick={() =>
              (async () => {
                await deleteReview({ author, packageName })
                setRemoved(true)
              })()
            }
          >
            Delete
          </Button>
        </CardActions>
      )}
    </Card>
  )
}

export default connector(Review)
