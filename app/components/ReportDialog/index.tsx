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
import { useTranslation } from 'react-i18next'

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

  const { t } = useTranslation()

  return (
    <Dialog open={true} onClose={onClose} aria-labelledby="form-dialog-title">
      <form
        onSubmit={handleSubmit(async ({ commentary }) => {
          setLoading(true)
          await reportReview({ reportedUser, commentary, packageName: name })
          setLoading(false)
          enqueueSnackbar(`${t('sentReport')}`)
          onClose()
        })}
      >
        <DialogTitle id="form-dialog-title">{t('reportReview')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            multiline
            margin="dense"
            name="commentary"
            label={t('infoReport')}
            inputRef={register({ required: true, minLength: 3, maxLength: 256 })}
            rows={10}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          {loading && <CircularProgress />}
          <Button onClick={onClose} color="primary">
            {t('cancel')}
          </Button>
          <Button color="primary" type="submit">
            {t('send')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default connector(ReportDialog)
