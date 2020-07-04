import React, { useState } from 'react'
import { InputAdornment, TextField } from '@material-ui/core'
import { Search } from '@material-ui/icons'

type SearchFieldProps = {
  query: string
  onEnter: (name: string) => void
}

const SearchField = ({ query, onEnter }: SearchFieldProps) => {
  const [name, setName] = useState(query)
  return (
    <TextField
      variant="outlined"
      size="medium"
      fullWidth
      color="primary"
      defaultValue={query}
      onChange={({ target: { value } }) => {
        setName(value)
      }}
      onKeyPress={({ key }) => {
        if (key === 'Enter') onEnter(name)
      }}
      InputProps={{
        style: { borderRadius: 45 },
        startAdornment: (
          <InputAdornment position="start">
            <Search />
          </InputAdornment>
        )
      }}
    />
  )
}

export default SearchField
