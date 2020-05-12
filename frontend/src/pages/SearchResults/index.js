import React, { useEffect } from 'react'
import PropTypes from 'prop-types'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import { Grid, makeStyles } from '@material-ui/core'
import { Pagination } from '@material-ui/lab'
import leven from 'leven'

import { formPackagePreviews } from './fetch'
import { alertActions, searchResultsActions } from '../../actions'
import { PackagePreviewSkeleton } from '../../components'

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
  },
  skeleton: {
    width: '80vw',
    height: '250px'
  }
}))

const SearchResults = ({
  setAlert,
  setPage,
  page,
  results,
  setResults,
  names,
  setNames,
  searchQuery
}) => {
  // Initial package names fetching effect
  useEffect(() => {
    let active = true
    const f = async () => {
      try {
        const res = await window.aptSearchPackageNames(searchQuery)
        if (active)
          setNames(res.sort((a, b) => leven(a, searchQuery) - leven(b, searchQuery)))
      } catch (e) {
        setAlert(e)
      }
    }

    f()
    return () => {
      active = false
    }
  }, [setNames, searchQuery, setAlert])

  // Effect that sets package previews depending on selected page
  useEffect(() => {
    if (names.length === 0) return
    let active = true
    const f = async () => {
      try {
        const rawPackageData = await window.aptSearch(
          names.slice((page - 1) * componentsInPage, page * componentsInPage)
        )
        if (!active) return
        const components = await formPackagePreviews(
          rawPackageData.slice(0, rawPackageData.length - 1)
        )
        setResults(components)
      } catch (e) {
        setAlert(e)
      }
    }

    f()
    return () => {
      active = false
    }
  }, [setResults, names, page, setAlert])

  const pageChange = (e, n) => {
    if (n === page) return

    setPage(n)
    setResults([])
  }

  const classes = useStyles()

  return (
    <div className={classes.root}>
      <h1>Showing results for {searchQuery}</h1>
      <Grid
        container
        direction='column'
        justify='space-evenly'
        alignItems='center'
        className={classes.grid}
      >
        {results && results.length === 0 ? (
          <>
            <PackagePreviewSkeleton />
            <PackagePreviewSkeleton />
            <PackagePreviewSkeleton />
            <PackagePreviewSkeleton />
            <PackagePreviewSkeleton />
          </>
        ) : (
          results
        )}
        <Pagination
          className={classes.pagination}
          count={Math.ceil(names.length / componentsInPage)}
          onChange={pageChange}
          page={page}
          variant='outlined'
          shape='rounded'
        />
      </Grid>
    </div>
  )
}

if (process.env.node_env === 'development') {
  SearchResults.propTypes = {
    setAlert: PropTypes.func,
    setPage: PropTypes.func,
    page: PropTypes.number,
    results: PropTypes.array,
    setResults: PropTypes.func,
    names: PropTypes.array,
    setNames: PropTypes.func,
    searchQuery: PropTypes.string.isRequired
  }
}

const mapStateToProps = ({
  searchResults,
  router: {
    location: {
      state: { searchQuery }
    }
  }
}) => ({
  ...searchResults,
  searchQuery
})

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      setAlert: alertActions.set,
      setPage: searchResultsActions.setPage,
      setResults: searchResultsActions.setResults,
      setNames: searchResultsActions.setNames
    },
    dispatch
  )

export default connect(mapStateToProps, mapDispatchToProps)(SearchResults)
