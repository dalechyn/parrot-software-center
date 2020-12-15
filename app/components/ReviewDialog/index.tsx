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
import { useTranslation } from 'react-i18next'

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

const ReviewDialog = ({
  onSubmit,
  onClose,
  report: { packageName, reportedBy, reportedUser },
  reviewReport,
  login
}: ReviewProps) => {
  const { handleSubmit, control, register } = useForm<{
    review: string
    deleteReview: boolean
    ban: boolean
  }>({
    defaultValues: { review: '', deleteReview: true, ban: false }
  })
  const { enqueueSnackbar } = useSnackbar()
  const { t } = useTranslation()
  return (
    <Dialog open={true} onClose={onClose} aria-labelledby="form-dialog-title">
      <form
        onSubmit={handleSubmit(async data => {
          await reviewReport({
            packageName,
            reportedBy,
            reportedUser,
            ...data,
            reviewedBy: login
          })
          enqueueSnackbar(`${t('sentReview')}`, { variant: 'success' })
          onSubmit()
        })}
      >
        <DialogTitle id="form-dialog-title">{t('review')}</DialogTitle>
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
              label={t('delUsrReview')}
            />
            <FormControlLabel
              control={
                <Controller as={<Checkbox />} control={control} name="ban" color="primary" />
              }
              label={t('banUsr')}
            />
          </div>
          <TextField
            autoFocus
            multiline
            margin="dense"
            name="review"
            label={t('putReview')}
            inputRef={register({ required: true, minLength: 3, maxLength: 256 })}
            rows={10}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button color="primary" type="submit">
            {t('send')}
          </Button>
          <Button onClick={onClose} color="primary">
            {t('cancel')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default connector(ReviewDialog)
