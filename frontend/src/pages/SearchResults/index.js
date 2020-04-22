import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useLocation } from 'react-router-dom'
import { CircularProgress, Grid, makeStyles } from '@material-ui/core'
import { Pagination } from '@material-ui/lab'

import { parseAndCacheResults } from './fetch'

const componentsInPage = 5

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexFlow: 'column',
    padding: theme.spacing(3)
  },
  grid: {
    display: 'inline-grid',
    gridGap: theme.spacing(2)
  },
  pagination: {
    justifySelf: 'center'
  },
  progress: {
    alignSelf: 'center'
  }
}))

const SearchResults = () => {
  const [result, setResult] = useState({ query: '', components: [] })
  const [page, setPage] = useState(1)
  const {
    state: { searchQuery, searchResult }
  } = useLocation()

  useEffect(() => {
    const f = async () => {
      setResult({
        query: searchQuery,
        components: await parseAndCacheResults(searchResult)
      })
    }
    f()
  }, [searchResult])

  const classes = useStyles()

  return (
    <div className={classes.root}>
      <h1>Showing results for {result.query}</h1>
      {result.components.length === 0 ? (
        <CircularProgress className={classes.progress} />
      ) : (
        <Grid
          container
          direction='column'
          justify='space-evenly'
          alignItems='center'
          className={classes.grid}
        >
          {result.components.slice(page - 1, page - 1 + componentsInPage)}
          <Pagination
            className={classes.pagination}
            count={Math.ceil(result.components.length / componentsInPage)}
            onChange={(e, n) => {
              setPage(n)
            }}
            variant='outlined'
            shape='rounded'
          />
        </Grid>
      )}
    </div>
  )
}

if (process.env.node_env === 'development') {
  SearchResults.propTypes = {
    classes: PropTypes.object
  }
}

export default SearchResults
