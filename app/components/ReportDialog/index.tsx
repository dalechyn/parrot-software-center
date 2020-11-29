import React, { useState } from 'react'
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
import { ReportInfo, reportReview } from '../../actions/reviews'

const mapDispatchToProps = { reportReview }

const connector = connect(null, mapDispatchToProps)

type ReportDialogProps = ConnectedProps<typeof connector> & {
  onClose: () => void
  name: string
  reportedUser: string
}

const ReportDialog = ({ name, reportedUser, onClose, reportReview }: ReportDialogProps) => {
  const [loading, setLoading] = useState(false)

  const { enqueueSnackbar } = useSnackbar()
  const { register, handleSubmit } = useForm<
    Pick<ReportInfo, 'reportedUser' | 'commentary' | 'packageName'>
  >()

  return (
    <Dialog open={true} onClose={onClose} aria-labelledby="form-dialog-title">
      <form
        onSubmit={handleSubmit(async ({ commentary }) => {
          setLoading(true)
          await reportReview({ reportedUser, commentary, packageName: name })
          setLoading(false)
          enqueueSnackbar('Your report is sent!')
          onClose()
        })}
      >
        <DialogTitle id="form-dialog-title">Share your review!</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            multiline
            margin="dense"
            name="commentary"
            label="Please describe your report"
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

export default connector(ReportDialog)
