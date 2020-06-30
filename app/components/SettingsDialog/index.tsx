import React from 'react'
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel
} from '@material-ui/core'
import { SettingsActions } from '../../actions'
import { connect, ConnectedProps } from 'react-redux'
import { Controller, useForm } from 'react-hook-form'
import { Settings } from '../../reducers/settings'
import { useSnackbar } from 'notistack'

const mapStateToProps = ({ settings }: RootState) => ({ settings })

const mapDispatchToProps = {
  ...SettingsActions
}

const connector = connect(mapStateToProps, mapDispatchToProps)

type SettingsDialogProps = ConnectedProps<typeof connector> & {
  onClose: () => void
}

const SettingsDialog = ({ onClose, save, settings }: SettingsDialogProps) => {
  const { handleSubmit, control } = useForm<Settings>({ defaultValues: settings })
  const { enqueueSnackbar } = useSnackbar()
  return (
    <Dialog open={true} onClose={onClose} aria-labelledby="form-dialog-title">
      <form
        onSubmit={handleSubmit(settings => {
          enqueueSnackbar('Settings saved!', { variant: 'success' })
          save(settings)
        })}
      >
        <DialogTitle id="form-dialog-title">Settings</DialogTitle>
        <DialogContent>
          <FormControlLabel
            control={
              <Controller
                as={<Checkbox />}
                control={control}
                checked={settings.loadCVEs}
                name="loadCVEs"
              />
            }
            color="primary"
            label="Load CVE Data (disabling may speed up the search)"
          />
        </DialogContent>
        <DialogActions>
          <Button color="primary" type="submit">
            Save
          </Button>
          <Button onClick={onClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default connector(SettingsDialog)
