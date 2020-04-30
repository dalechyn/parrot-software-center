import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'

import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { push } from 'connected-react-router'

import { debounce, CircularProgress, TextField } from '@material-ui/core'
import { Autocomplete } from '@material-ui/lab'
import { Search } from '@material-ui/icons'
import leven from 'leven'

import { alertActions } from '../../actions'
import { delayPromise } from './utils'

const requestTimeout = 5000

const styles = {
  root: {
    width: 300
  }
}

const SearchBar = ({ setAlert, clearAlert, push }) => {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [options, setOptions] = useState([])
  const [value, setValue] = useState('')

  useEffect(() => {
    let active = true

    debounce(() => {
      const fetchCompletion = async name => {
        try {
          const response = await window.aptSearchPackageNames(name)
          setOptions(response.sort((a, b) => leven(a, name) - leven(b, name)).slice(0, 5))
        } catch (e) {
          setOptions([])
        }
        setLoading(false)
      }

      if (value.length > 2) {
        setLoading(true)
        if (active) fetchCompletion(value)
      } else setOptions([])
    }, 1000)()

    return () => {
      active = false
      setLoading(false)
    }
  }, [value])

  const handleBlur = () => {
    if (value.trim().length === 0) setValue('')
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
    clearAlert()
    try {
      await Promise.race([
        delayPromise(requestTimeout),
        (async () => {
          push({
            pathname: '/search',
            state: { searchQuery: value }
          })
          clearAlert()
        })()
      ])
    } catch (e) {
      setAlert(e)
    }
  }
  const handleKeyUp = async e => {
    if (e.charCode === 13 || e.key === 'Enter') {
      await handleRequestSearch()
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
    clearAlert: PropTypes.func,
    setAlert: PropTypes.func,
    push: PropTypes.func
  }
}

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      clearAlert: alertActions.clear,
      setAlert: alertActions.set,
      push
    },
    dispatch
  )

export default connect(null, mapDispatchToProps)(SearchBar)
