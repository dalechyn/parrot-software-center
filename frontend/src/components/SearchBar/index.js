import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { debounce, CircularProgress, TextField } from '@material-ui/core'

import { Autocomplete } from '@material-ui/lab'
import { grey } from '@material-ui/core/colors'
import PropTypes from 'prop-types'

import { withTimeout } from '../../utils'

const requestTimeout = 5000

const styles = {
  root: {
    width: 300
  }
}

const SearchBar = ({ setError }) => {
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = useState(false)
  const [options, setOptions] = React.useState([])
  const [value, setValue] = useState('')
  const history = useHistory()

  useEffect(() => {
    let active = true

    const fetchCompletion = async name => {
      const response = await window.aptAutoComplete(name)
      setLoading(false)

      if (active) {
        const fetchedOptions = response.split('\n')
        fetchedOptions.pop()
        setOptions(fetchedOptions)
      }
    }
    if (value.length > 2) {
      setLoading(true)
      fetchCompletion(value)
    } else setOptions([])

    return () => {
      active = false
    }
  }, [value])

  const handleBlur = () => {
    if (value.trim().length === 0) {
      setValue('')
    }
  }
  const debouncedSetValue = debounce(setValue, 300)
  const handleInput = (e, newValue) => debouncedSetValue(newValue)
  const handleChange = (e, value, reason) => {
    if (reason === 'select-option') setValue(value)
  }
  const handleCancel = () => {
    setValue('')
  }
  const handleRequestSearch = () => {
    withTimeout(
      requestTimeout,
      window.aptSearch(value).then(
        res => {
          history.push({
            pathname: '/search',
            state: { searchQuery: value, searchResult: res }
          })
          setError()
        },
        err => setError(err)
      )
    ).catch(err => setError(err))
  }
  const handleKeyUp = e => {
    if (e.charCode === 13 || e.key === 'Enter') {
      handleRequestSearch()
    } else if (e.charCode === 27 || e.key === 'Escape') {
      handleCancel()
    }
  }

  return (
    <Autocomplete
      id='search-bar'
      style={styles.root}
      freeSolo
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      options={options}
      loading={loading}
      onChange={handleChange}
      onInputChange={handleInput}
      renderInput={params => (
        <TextField
          {...params}
          onKeyUp={handleKeyUp}
          onBlur={handleBlur}
          element={TextField}
          label='Search a package'
          variant='outlined'
          size='small'
          color='secondary'
          inputProps={{ ...params.inputProps, autoComplete: 'new-password' }}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading && <CircularProgress color='inherit' size={20} />}
                {params.InputProps.endAdornment}
              </>
            )
          }}
        />
      )}
    />
  )
}

if (process.env.node_env === 'development') {
  SearchBar.propTypes = {
    setError: PropTypes.func
  }
}

export default SearchBar
