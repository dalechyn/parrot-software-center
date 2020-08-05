import React, { KeyboardEvent, ChangeEvent, useEffect, useState } from 'react'

import { connect, ConnectedProps } from 'react-redux'
import { push } from 'connected-react-router'

import { debounce, CircularProgress, TextField } from '@material-ui/core'
import { Autocomplete } from '@material-ui/lab'
import { Search } from '@material-ui/icons'
import leven from 'leven'

import { AlertActions, AptActions } from '../../actions'
import { unwrapResult } from '@reduxjs/toolkit'

const styles = {
  root: {
    width: 300
  }
}

const mapDispatchToProps = {
  clearAlert: AlertActions.clear,
  searchPreviews: AptActions.searchPreviews,
  push
}

const connector = connect(null, mapDispatchToProps)

type SearchBarProps = ConnectedProps<typeof connector>

const SearchBar = ({ clearAlert, push, searchPreviews }: SearchBarProps) => {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [options, setOptions] = useState(Array<string>())
  const [value, setValue] = useState('')

  useEffect(() => {
    let active = true

    debounce(() => {
      const fetchCompletion = async (name: string) => {
        setLoading(true)
        const response = await searchPreviews(name)
        if (!active) {
          setLoading(false)
          return
        }

        setOptions(
          unwrapResult(response)
            .map(preview => preview.name)
            .sort((a: string, b: string) => leven(a, name) - leven(b, name))
            .slice(0, 5)
        )
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
      style={styles.root}
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
          label="Search a package"
          variant="outlined"
          size="small"
          color="primary"
          inputProps={{ ...params.inputProps, autoComplete: 'new-password' }}
          InputProps={{
            ...params.InputProps,
            startAdornment: <Search />,
            endAdornment: (
              <>
                {loading && <CircularProgress color="inherit" size={20} />}
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
