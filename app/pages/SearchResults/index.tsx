import React, { ChangeEvent, useEffect } from 'react'
import PropTypes from 'prop-types'

import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'

import { Grid, makeStyles } from '@material-ui/core'
import { Pagination } from '@material-ui/lab'
import leven from 'leven'

import { formPackagePreviews } from './fetch'
import { AlertActions, SearchResultsActions } from '../../actions'
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

const mapStateToProps = ({
  searchResults,
  router: {
    location: { state: { searchQuery } = {} }
  }
}: RootState) => ({
  ...searchResults,
  searchQuery
})

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) =>
  bindActionCreators(
    {
      alert: AlertActions.set,
      scroll: SearchResultsActions.scroll,
      cacheResults: SearchResultsActions.cacheResults,
      cacheNames: SearchResultsActions.cacheNames
    },
    dispatch
  )

type SearchResultsProps = ReturnType<typeof mapStateToProps> | ReturnType<typeof mapDispatchToProps>

const SearchResults = ({
  alert,
  scroll,
  page,
  results,
  cacheResults,
  names,
  cacheNames,
  searchQuery
}: SearchResultsProps) => {
  // Initial package names fetching effect
  useEffect(() => {
    let active = true
    const f = async () => {
      try {
        const res = await window.aptSearchPackageNames(searchQuery)
        if (active)
          cacheNames(
            res.sort((a: string, b: string) => leven(a, searchQuery) - leven(b, searchQuery))
          )
      } catch (e) {
        alert(e)
      }
    }

    f()
    return () => {
      active = false
    }
  }, [cacheNames, searchQuery, alert])

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
        cacheResults(components)
      } catch (e) {
        alert(e)
      }
    }

    f()
    return () => {
      active = false
    }
  }, [cacheResults, names, page, alert])

  const pageChange = (e: ChangeEvent, n: number) => {
    if (n === page) return

    scroll(n)
    cacheResults([])
  }

  const classes = useStyles()

  return (
    <div className={classes.root}>
      <h1>Showing results for {searchQuery}</h1>
      <Grid
        container
        direction="column"
        justify="space-evenly"
        alignItems="center"
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
          variant="outlined"
          shape="rounded"
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

export default connect(mapStateToProps, mapDispatchToProps)(SearchResults)
