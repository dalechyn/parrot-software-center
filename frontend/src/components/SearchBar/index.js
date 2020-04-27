import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { debounce, CircularProgress, TextField } from '@material-ui/core'

import { Autocomplete } from '@material-ui/lab'
import { Search } from '@material-ui/icons'
import PropTypes from 'prop-types'

import { delayPromise } from './utils'

const requestTimeout = 5000

const styles = {
  root: {
    width: 300
  }
}

const SearchBar = ({ setError }) => {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [options, setOptions] = useState([])
  const [value, setValue] = useState('')
  const history = useHistory()

  useEffect(() => {
    let active = true

    debounce(() => {
      const fetchCompletion = async name => {
        if (active) {
          const response = await window.aptAutoComplete(name)
          setLoading(false)
          setOptions(response)
        }
      }

      if (value.length > 2) {
        setLoading(true)
        fetchCompletion(value)
      } else setOptions([])
    }, 300)()

    return () => {
      active = false
    }
  }, [value])

  const handleBlur = () => {
    if (value.trim().length === 0) {
      setValue('')
    }
  }
  const handleInput = (e, newValue) => {
    setValue(newValue)
  }
  const handleChange = (e, value, reason) => {
    if (reason === 'select-option') setValue(value)
  }
  const handleCancel = () => {
    setValue('')
  }
  const handleRequestSearch = async () => {
    if (value === '') return
    try {
      await Promise.race([
        delayPromise(requestTimeout),
        (async () => {
          try {
            history.push({
              pathname: '/search',
              state: { searchQuery: value }
            })
            setError()
          } catch (e) {
            setError(e)
          }
        })()
      ])
    } catch (e) {
      setError(e)
    }
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
            startAdornment: <Search />,
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
