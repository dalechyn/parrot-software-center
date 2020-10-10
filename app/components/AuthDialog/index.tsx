import React, { useState } from 'react'
import {
  Button,
  CircularProgress,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Link,
  FormControl,
  InputLabel,
  Input,
  InputAdornment,
  IconButton,
  FormHelperText
} from '@material-ui/core'
import { useSnackbar } from 'notistack'
import { AuthActions } from '../../actions'
import { connect, ConnectedProps } from 'react-redux'
import { unwrapResult } from '@reduxjs/toolkit'
import { useForm } from 'react-hook-form'
import { Visibility, VisibilityOff } from '@material-ui/icons'

const mapDispatchToProps = {
  login: AuthActions.login,
  register: AuthActions.register
}

const connector = connect(null, mapDispatchToProps)

type AuthDialogProps = ConnectedProps<typeof connector> & {
  onClose: () => void
}

type FormData = {
  login: string
  email: string
  password: string
}

const emailRegExp = /^(?:(?:[^<>()\[\]\\.,;:\s@"]+(?:\.[^<>()\[\]\\.,;:\s@"]+)*)|(?:".+"))@(?:(?:\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(?:(?:[a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

const AuthDialog = ({ onClose, login: loginAction, register: registerAction }: AuthDialogProps) => {
  const [registered, setRegistered] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const { enqueueSnackbar } = useSnackbar()
  const { register, handleSubmit, errors, clearError } = useForm<FormData>()

  return (
    <Dialog open={true} onClose={onClose} aria-labelledby="form-dialog-title">
      <form
        onSubmit={handleSubmit(async ({ login, email, password }) => {
          try {
            if (registered) {
              setLoading(true)
              const action = await loginAction({ login, password })
              unwrapResult(action)
              enqueueSnackbar('Logged in successfully')
              onClose()
            } else {
              setLoading(true)
              const action = await registerAction({ email, login, password })
              unwrapResult(action)
              enqueueSnackbar(
                'Registered successfully, confirm your account in a message we sent to the email'
              )
              onClose()
            }
          } catch (e) {
            setError(e.message)
          }
          setLoading(false)
        })}
      >
        <DialogTitle id="form-dialog-title">{registered ? 'Log in' : 'Register'}</DialogTitle>
        <DialogContent>
          {!registered && (
            <TextField
              autoFocus
              margin="dense"
              name="email"
              label="Email Address"
              onChange={() => setError('')}
              type="email"
              error={!!(errors.email || error)}
              helperText={error ? error : errors.email && 'Wrong email format'}
              inputRef={register({ required: true, pattern: emailRegExp })}
              fullWidth
            />
          )}
          <TextField
            autoFocus
            margin="dense"
            name="login"
            label="Login"
            type="login"
            onChange={() => setError('')}
            error={!!(errors.login || error)}
            helperText={error ? error : 'Login needs to have 3-20 symbols'}
            inputRef={register({ required: true, minLength: 3, maxLength: 20 })}
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel>Password</InputLabel>
            <Input
              fullWidth
              name="password"
              type={showPassword ? 'text' : 'password'}
              inputRef={register({ required: true, minLength: 6, maxLength: 20 })}
              error={!!errors.password}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    onMouseDown={event => event.preventDefault()}
                  >
                    {showPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              }
            />
            <FormHelperText>Password needs to have 6-20 symbols</FormHelperText>
          </FormControl>
          <Link
            component="button"
            type="button"
            variant="body1"
            onClick={() => {
              clearError('login')
              clearError('password')
              clearError('email')
              setRegistered(!registered)
              setError('')
            }}
          >
            {registered ? 'Not registered? Register now.' : 'Already registered? Login now.'}
          </Link>
        </DialogContent>
        <DialogActions>
          {loading && <CircularProgress />}
          <Button onClick={onClose} color="primary">
            Cancel
          </Button>
          <Button color="primary" type="submit">
            {registered ? 'Login' : 'Register'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default connector(AuthDialog)
