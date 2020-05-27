import React, { ChangeEvent, useEffect } from 'react'
import { connect, ConnectedProps, useDispatch } from 'react-redux'

import { Grid, makeStyles } from '@material-ui/core'
import { Pagination } from '@material-ui/lab'
import leven from 'leven'

import { formPackagePreviews } from './fetch'
import { AptActions, AlertActions, SearchResultsActions } from '../../actions'
import { PackagePreviewSkeleton } from '../../components'
import { unwrapResult } from '@reduxjs/toolkit'

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
    location: {
      state: { searchQuery }
    }
  }
}: RootState) => ({
  ...searchResults,
  searchQuery
})

const mapDispatchToProps = {
  alert: AlertActions.set,
  scroll: SearchResultsActions.scroll,
  cacheResults: SearchResultsActions.cacheResults,
  cacheNames: SearchResultsActions.cacheNames,
  searchNames: AptActions.searchNames,
  search: AptActions.search
}

const connector = connect(mapStateToProps, mapDispatchToProps)

type SearchResultsProps = ConnectedProps<typeof connector>

const SearchResults = ({
  alert,
  scroll,
  page,
  results,
  cacheResults,
  names,
  cacheNames,
  searchNames,
  search,
  searchQuery = ''
}: SearchResultsProps) => {
  // Initial package names fetching effect
  useEffect(() => {
    let active = true
    const f = async () => {
      try {
        const response = await searchNames(searchQuery)
        if (active && AptActions.searchNames.fulfilled.match(response))
          cacheNames(
            unwrapResult(response).sort(
              (a: string, b: string) => leven(a, searchQuery) - leven(b, searchQuery)
            )
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
        const response = await search(
          names.slice((page - 1) * componentsInPage, page * componentsInPage)
        )
        if (active && AptActions.search.fulfilled.match(response)) {
          const result = unwrapResult(response)
          const components = await formPackagePreviews(
            result.slice(0, result.length - 1),
            useDispatch()
          )
          cacheResults(components)
        }
      } catch (e) {
        alert(e)
      }
    }

    f()
    return () => {
      active = false
    }
  }, [cacheResults, names, page, alert])

  const pageChange = (_: ChangeEvent<unknown>, n: number) => {
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

export default connector(SearchResults)
