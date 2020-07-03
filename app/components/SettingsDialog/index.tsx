import React from 'react'
import {
  Button,
  Switch,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel
} from '@material-ui/core'
import { SettingsActions } from '../../actions'
import { connect, ConnectedProps } from 'react-redux'
import { Controller, useForm } from 'react-hook-form'
import { useSnackbar } from 'notistack'
import { Settings } from '../../reducers/settings'

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
        onSubmit={handleSubmit(data => {
          enqueueSnackbar('Settings saved!', { variant: 'success' })
          save(data)
        })}
      >
        <DialogTitle id="form-dialog-title">Settings</DialogTitle>
        <DialogContent>
          <FormControlLabel
            control={
              <Controller
                as={<Switch />}
                control={control}
                checked={settings.loadCVEs}
                name="loadCVEs"
                color="primary"
              />
            }
            color="primary"
            label="Load CVE Data (disabling may speed up the search)"
          />
          <FormControlLabel
            control={
              <Controller
                as={<Switch />}
                control={control}
                checked={settings.darkTheme}
                name="darkTheme"
                color="primary"
              />
            }
            color="primary"
            label="Use Dark Theme"
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
