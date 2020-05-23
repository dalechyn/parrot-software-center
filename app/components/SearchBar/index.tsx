import React, { KeyboardEvent, ChangeEvent, useEffect, useState } from 'react'

import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'
import { Push, push } from 'connected-react-router'

import { debounce, CircularProgress, TextField } from '@material-ui/core'
import { Autocomplete } from '@material-ui/lab'
import { Search } from '@material-ui/icons'
import leven from 'leven'

import { AlertActions } from '../../actions'

export const delayPromise = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const requestTimeout = 5000

const styles = {
  root: {
    width: 300
  }
}

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) =>
  bindActionCreators(
    {
      clearAlert: AlertActions.clear,
      setAlert: AlertActions.set,
      push
    },
    dispatch
  )

type SearchBarProps = ReturnType<typeof mapDispatchToProps> & ReturnType<Push>

const SearchBar: React.FC<SearchBarProps> = ({ setAlert, clearAlert, push }) => {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [options, setOptions] = useState([])
  const [value, setValue] = useState('')

  useEffect(() => {
    let active = true

    debounce(() => {
      const fetchCompletion = async (name: string) => {
        try {
          // TODO: Commented until project typescriptization
          // const response = await window.aptSearchPackageNames(name)
          // setOptions(response.sort((a: string, b: string) => leven(a, name) - leven(b, name)).slice(0, 5))
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
  const handleInput = (e: InputEvent, newValue: string) => {
    setValue(newValue)
  }
  const handleChange = (e: ChangeEvent<HTMLInputElement>, value: string, reason: string) => {
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
          push('/search', { searchQuery: value })
          clearAlert()
        })()
      ])
    } catch (e) {
      setAlert(e)
    }
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
      onChange={handleChange}
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

export default connect(null, mapDispatchToProps)(SearchBar)
