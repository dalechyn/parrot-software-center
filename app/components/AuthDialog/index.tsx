import React, { useState } from 'react'
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Link
} from '@material-ui/core'
import { useSnackbar } from 'notistack'
import { AuthActions } from '../../actions'
import { connect, ConnectedProps } from 'react-redux'

const mapDispatchToProps = {
  login: AuthActions.login,
  register: AuthActions.register
}

const connector = connect(null, mapDispatchToProps)

type AuthDialogProps = ConnectedProps<typeof connector> & {
  open: boolean
  onClose: () => void
}

const AuthDialog = ({
  open,
  onClose,
  login: loginAction,
  register: registerAction
}: AuthDialogProps) => {
  const [registered, setRegistered] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [login, setLogin] = useState('')

  const { enqueueSnackbar } = useSnackbar()

  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="form-dialog-title">
      <DialogTitle id="form-dialog-title">{registered ? 'Log in' : 'Register'}</DialogTitle>
      <DialogContent>
        {!registered && (
          <TextField
            autoFocus
            margin="dense"
            id="email"
            label="Email Address"
            type="email"
            onChange={({ target: { value } }) => setEmail(value)}
            fullWidth
          />
        )}
        <TextField
          autoFocus
          margin="dense"
          id="login"
          label="Login"
          type="login"
          fullWidth
          onChange={({ target: { value } }) => setLogin(value)}
        />
        <TextField
          autoFocus
          margin="dense"
          id="password"
          label="Password"
          onChange={({ target: { value } }) => setPassword(value)}
          type="password"
          fullWidth
        />
        <Link
          component="button"
          variant="body2"
          onClick={() => {
            setRegistered(!registered)
          }}
        >
          {registered ? 'Not registered? Register now.' : 'Already registered? Login now.'}
        </Link>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button
          onClick={async () => {
            if (registered) {
              const action = await loginAction({ login, password })
              if (AuthActions.login.fulfilled.match(action)) {
                enqueueSnackbar('Logged in successfully')
                onClose()
              }
            } else {
              const action = await registerAction({ email, login, password })
              if (AuthActions.register.fulfilled.match(action)) {
                enqueueSnackbar(
                  'Registered successfully, confirm your account in a message we sent to the email'
                )
                onClose()
              }
            }
          }}
          color="primary"
        >
          {registered ? 'Login' : 'Register'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default connector(AuthDialog)
