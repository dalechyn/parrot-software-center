import React, { ChangeEvent, KeyboardEvent, useEffect, useState } from 'react'
import {
  CircularProgress,
  debounce,
  InputAdornment,
  TextField,
  makeStyles
} from '@material-ui/core'
import { Search } from '@material-ui/icons'
import { AlertActions, AptActions } from '../../actions'
import { connect, ConnectedProps } from 'react-redux'
import { unwrapResult } from '@reduxjs/toolkit'
import { Autocomplete } from '@material-ui/lab'

const useStyles = makeStyles({
  whiteColor: {
    color: 'white'
  },
  notchedOutline: {
    borderColor: '#2196f3 !important'
  }
})

const mapDispatchToProps = {
  clearAlert: AlertActions.clear,
  fetchAutocompletion: AptActions.fetchAutocompletion
}

const connector = connect(null, mapDispatchToProps)

type SearchFieldProps = {
  query: string
  onEnter: (name: string) => void
} & ConnectedProps<typeof connector>

const SearchField = ({ query, onEnter, fetchAutocompletion }: SearchFieldProps) => {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [options, setOptions] = useState(Array<string>())
  const [value, setValue] = useState(query)

  const classes = useStyles()

  useEffect(() => {
    let active = true

    debounce(() => {
      const fetchCompletion = async (name: string) => {
        setLoading(true)
        const response = unwrapResult(await fetchAutocompletion(name))
        if (!active) {
          setLoading(false)
          return
        }

        setOptions(response.slice(0, 5))
        setLoading(false)
      }

      if (value.length > 2) {
        if (active) fetchCompletion(value)
      }
    }, 1000)()

    return () => {
      active = false
      setLoading(false)
    }
  }, [value])

  const handleBlur = () => {
    if (value.trim().length === 0) setValue('')
  }
  const handleChange = (_: ChangeEvent<{}>, value: string) => {
    setValue(value)
  }
  const handleCancel = () => {
    setValue('')
  }
  const handleRequestSearch = () => {
    if (value === '') return
    onEnter(value)
  }
  const handleKeyUp = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      handleRequestSearch()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }
  return (
    <Autocomplete
      id="search-bar"
      classes={{ clearIndicator: classes.whiteColor }}
      freeSolo
      defaultValue={value}
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      options={options}
      loading={loading}
      inputValue={value}
      onInputChange={handleChange}
      renderInput={params => (
        <TextField
          {...params}
          variant="outlined"
          size="medium"
          fullWidth
          color="primary"
          onKeyUp={handleKeyUp}
          onBlur={handleBlur}
          inputProps={{ ...params.inputProps, autoComplete: 'new-password' }}
          InputProps={{
            ...params.InputProps,
            style: { borderRadius: 45 },
            startAdornment: (
              <InputAdornment position="start" style={{ marginLeft: '1rem' }}>
                <Search />
              </InputAdornment>
            ),
            classes: {
              root: classes.whiteColor,
              notchedOutline: classes.notchedOutline,
              adornedEnd: classes.whiteColor
            },
            endAdornment: (
              <>
                {loading && <CircularProgress disableShrink color="inherit" size={20} />}
                {params.InputProps.endAdornment}
              </>
            )
          }}
        />
      )}
    />
  )
}

export default connector(SearchField)
