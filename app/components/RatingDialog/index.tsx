import React, { useState } from 'react'
import { AptActions } from '../../actions'
import {
  Button,
  CircularProgress,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle
} from '@material-ui/core'
import { useSnackbar } from 'notistack'
import { connect, ConnectedProps } from 'react-redux'
import { useForm } from 'react-hook-form'
import { Rating } from '@material-ui/lab'

const mapStateToProps = ({ auth: { token } }: RootState) => ({
  token
})

const mapDispatchToProps = { rate: AptActions.rate }

const connector = connect(mapStateToProps, mapDispatchToProps)

type RatingDialogProps = ConnectedProps<typeof connector> & {
  onClose: () => void
  rating: number
}

type FormData = {
  rating: number
  commentary: string
}

const RatingDialog = ({ onClose, rating, token, rate }: RatingDialogProps) => {
  const [loading, setLoading] = useState(false)

  const { enqueueSnackbar } = useSnackbar()
  const { register, handleSubmit } = useForm<FormData>()

  return (
    <Dialog open={true} onClose={onClose} aria-labelledby="form-dialog-title">
      <form
        onSubmit={handleSubmit(async ({ rating, commentary }) => {
          setLoading(true)
          rate({ token, rating, commentary })
          setLoading(false)
          enqueueSnackbar('Your review is sent!')
          onClose()
        })}
      >
        <DialogTitle id="form-dialog-title">Share your review!</DialogTitle>
        <DialogContent>
          <Rating name="rating" defaultValue={rating} ref={register()} />
          <TextField
            autoFocus
            multiline
            margin="dense"
            name="commentary"
            label="Commentary"
            inputRef={register({ required: true, minLength: 3, maxLength: 256 })}
            rows={10}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          {loading && <CircularProgress />}
          <Button onClick={onClose} color="primary">
            Cancel
          </Button>
          <Button color="primary" type="submit">
            Send
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default connector(RatingDialog)
