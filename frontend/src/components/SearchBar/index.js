import React, { useState } from 'react'
import { Paper, Input, IconButton, withStyles } from '@material-ui/core'
import { Clear, Search } from '@material-ui/icons'
import classNames from 'classnames'

const styles = {
  root: {
    height: 48,
    display: 'flex',
    justifyContent: 'space-between'
  },
  iconButton: {
    opacity: 0.54,
    transform: 'scale(1, 1)',
    transition: 'transform 200ms cubic-bezier(0.4, 0.0, 0.2, 1)'
  },
  iconButtonHidden: {
    transform: 'scale(0, 0)',
    '& > $icon': {
      opacity: 0
    }
  },
  iconButtonDisabled: {
    opacity: 0.38
  },
  searchIconButton: {
    marginRight: -48
  },
  icon: {
    opacity: 0.85,
    transition: 'opacity 200ms cubic-bezier(0.4, 0.0, 0.2, 1)'
  },
  input: {
    width: '100%'
  },
  searchContainer: {
    margin: 'auto 16px',
    width: 'calc(100% - 48px - 32px)' // 48px button + 32px margin
  }
}

const SearchBar = ({ classes, setError }) => {
  const [value, setValue] = useState('')
  const handleBlur = () => {
    if (value.trim().length === 0) {
      setValue('')
    }
  }

  const handleInput = e => setValue(e.target.value)

  const handleCancel = () => {
    handleRequestSearch()
  }

  const handleRequestSearch = () => {
    window.aptShow(value.split(' ')).then(
      res => {
        console.log(res)
      },
      () => {
        setError(value)
      }
    )
    // handle request
  }

  const handleKeyUp = e => {
    if (e.charCode === 13 || e.key === 'Enter') {
      handleRequestSearch()
    } else if (e.charCode === 27 || e.key === 'Escape') {
      handleCancel()
    }
  }

  return (
    <Paper className={classes.root}>
      <div className={classes.searchContainer}>
        <Input
          onBlur={handleBlur}
          value={value}
          onChange={handleInput}
          onKeyUp={handleKeyUp}
          fullWidth
          className={classes.input}
          disableUnderline
        />
      </div>
      <IconButton
        onClick={handleRequestSearch}
        classes={{
          root: classNames(classes.iconButton, classes.searchIconButton, {
            [classes.iconButtonHidden]: value !== ''
          }),
          disabled: classes.iconButtonDisabled
        }}
      >
        {React.cloneElement(<Search />, {
          classes: { root: classes.icon }
        })}
      </IconButton>
      <IconButton
        onClick={handleCancel}
        classes={{
          root: classNames(classes.iconButton, {
            [classes.iconButtonHidden]: value === ''
          }),
          disabled: classes.iconButtonDisabled
        }}
      >
        {React.cloneElement(<Clear />, {
          classes: { root: classes.icon }
        })}
      </IconButton>
    </Paper>
  )
}

export default withStyles(styles)(SearchBar)
