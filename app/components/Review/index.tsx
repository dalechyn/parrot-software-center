import React from 'react'
import { CardContent, Card, Typography, CardHeader, Divider } from '@material-ui/core'
import { Rating } from '@material-ui/lab'

type ReviewProps = {
  author: string
  commentary: string
  rating: number
}

const Review = ({ author, rating, commentary }: ReviewProps) => (
  <Card style={{ width: '100%' }}>
    <CardHeader
      title={author}
      subheader={<Rating style={{ marginLeft: 'auto' }} value={rating} readOnly />}
    />
    <Divider />
    <CardContent>
      <Typography>{commentary}</Typography>
    </CardContent>
  </Card>
)

export default Review
