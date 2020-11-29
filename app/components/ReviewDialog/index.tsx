import React from 'react'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  TextField,
  Checkbox
} from '@material-ui/core'
import { ReviewsActions } from '../../actions'
import { connect, ConnectedProps } from 'react-redux'
import { Controller, useForm } from 'react-hook-form'
import { useSnackbar } from 'notistack'
import { ReportInfo } from '../../actions/reviews'

const mapStateToProps = ({ auth: { login } }: RootState) => ({ login })

const mapDispatchToProps = {
  reviewReport: ReviewsActions.reviewReport
}

const connector = connect(mapStateToProps, mapDispatchToProps)

type ReviewProps = ConnectedProps<typeof connector> & {
  report: ReportInfo
  onClose: () => void
  onSubmit: () => void
}

const ReviewDialog = ({ onSubmit, onClose, report, reviewReport, login }: ReviewProps) => {
  const { handleSubmit, control, register } = useForm<
    ReportInfo & { deleteReview: boolean; ban: boolean }
  >({
    defaultValues: { review: '', deleteReview: true, ban: false }
  })
  const { enqueueSnackbar } = useSnackbar()
  return (
    <Dialog open={true} onClose={onClose} aria-labelledby="form-dialog-title">
      <form
        onSubmit={handleSubmit(async data => {
          await reviewReport({
            ...report,
            ...data,
            reviewedDate: new Date().toISOString(),
            reviewedBy: login,
            reviewed: true
          })
          enqueueSnackbar('Review sent!', { variant: 'success' })
          onSubmit()
        })}
      >
        <DialogTitle id="form-dialog-title">Review</DialogTitle>
        <DialogContent>
          <div>
            <FormControlLabel
              control={
                <Controller
                  as={<Checkbox />}
                  control={control}
                  name="deleteReview"
                  color="primary"
                />
              }
              label="Delete user review"
            />
            <FormControlLabel
              control={
                <Controller as={<Checkbox />} control={control} name="ban" color="primary" />
              }
              label="Ban user"
            />
          </div>
          <TextField
            autoFocus
            multiline
            margin="dense"
            name="review"
            label="Put your review here"
            inputRef={register({ required: true, minLength: 3, maxLength: 256 })}
            rows={10}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button color="primary" type="submit">
            Send
          </Button>
          <Button onClick={onClose} color="primary">
            Cancel
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default connector(ReviewDialog)
