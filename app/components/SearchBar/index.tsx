import React, { KeyboardEvent, ChangeEvent, useEffect, useState } from 'react'

import { connect, ConnectedProps } from 'react-redux'
import { push } from 'connected-react-router'

import { debounce, CircularProgress, TextField, makeStyles } from '@material-ui/core'
import { Autocomplete } from '@material-ui/lab'
import { Search } from '@material-ui/icons'

import { AlertActions, AptActions } from '../../actions'
import { unwrapResult } from '@reduxjs/toolkit'

import { useTranslation } from 'react-i18next';

const useStyles = makeStyles({
  root: {
    color: 'white',
    width: 300
  },
  whiteColor: {
    color: 'white'
  },
  notchedOutline: {
    borderColor: 'white !important'
  }
})

const mapDispatchToProps = {
  clearAlert: AlertActions.clear,
  fetchAutocompletion: AptActions.fetchAutocompletion,
  push
}

const connector = connect(null, mapDispatchToProps)

type SearchBarProps = ConnectedProps<typeof connector>

const SearchBar = ({ clearAlert, push, fetchAutocompletion }: SearchBarProps) => {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [options, setOptions] = useState(Array<string>())
  const [value, setValue] = useState('')

  // using "useTranslation" hook
  const { t } = useTranslation();

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
    clearAlert()
    const scoped = value
    setValue('')
    push(`/search/${scoped}`)
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
      className={classes.root}
      freeSolo
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
          onKeyUp={handleKeyUp}
          onBlur={handleBlur}
          label={<div style={{ display: 'inline-block', color: 'white' }}>{t('searchPkg')}</div>}
          variant="outlined"
          size="small"
          inputProps={{ ...params.inputProps, autoComplete: 'new-password' }}
          InputProps={{
            ...params.InputProps,
            startAdornment: <Search />,
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

export default connector(SearchBar)
