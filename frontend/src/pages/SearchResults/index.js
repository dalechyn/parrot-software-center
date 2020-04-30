import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import { Grid, makeStyles } from '@material-ui/core'
import { Pagination, Skeleton } from '@material-ui/lab'
import leven from 'leven'

import { formPackagePreviews } from './fetch'
import { alertActions, searchResultsActions } from '../../actions'

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

const SearchResults = ({ searchQuery, setAlert, setPage, page }) => {
  const [resultsNames, setResultsNames] = useState([])
  const [packagePreviews, setPackagePreviews] = useState([])

  // Initial package names fetching effect
  useEffect(() => {
    if (searchQuery === '') return
    let active = true
    setPackagePreviews([])
    const f = async () => {
      try {
        const res = await window.aptSearchPackageNames(searchQuery)
        if (active)
          setResultsNames(
            res.sort((a, b) => leven(a, searchQuery) - leven(b, searchQuery))
          )
      } catch (e) {
        setAlert(e)
      }
    }

    f()
    return () => {
      active = false
    }
  }, [searchQuery, setAlert])

  // Effect that sets package previews depending on selected page
  useEffect(() => {
    if (resultsNames.length === 0) return
    let active = true
    const f = async () => {
      try {
        const rawPackageData = await window.aptSearch(
          resultsNames.slice((page - 1) * componentsInPage, page * componentsInPage)
        )
        if (!active) return
        const components = await formPackagePreviews(rawPackageData)

        if (!active) return
        setPackagePreviews(components)
      } catch (e) {
        setAlert(e)
      }
    }

    f()
    return () => {
      active = false
    }
  }, [resultsNames, page, setAlert])

  const pageChange = (e, n) => {
    if (n === page) return

    setPage(n)
    setPackagePreviews([])
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
        <Pagination
          className={classes.pagination}
          count={Math.ceil(resultsNames.length / componentsInPage)}
          onChange={pageChange}
          page={page}
          variant='outlined'
          shape='rounded'
        />
        {packagePreviews.length === 0 ? (
          <>
            <Skeleton className={classes.skeleton} variant='rect' />
            <Skeleton className={classes.skeleton} variant='rect' />
            <Skeleton className={classes.skeleton} variant='rect' />
            <Skeleton className={classes.skeleton} variant='rect' />
            <Skeleton className={classes.skeleton} variant='rect' />
          </>
        ) : (
          packagePreviews
        )}
        <Pagination
          className={classes.pagination}
          count={Math.ceil(resultsNames.length / componentsInPage)}
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
    searchQuery: PropTypes.string
  }
}

const mapStateToProps = ({
  router: {
    location: {
      state: { searchQuery }
    }
  },
  searchResults: { page }
}) => ({ searchQuery, page })

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      setAlert: alertActions.set,
      setPage: searchResultsActions.pageSet
    },
    dispatch
  )

export default connect(mapStateToProps, mapDispatchToProps)(SearchResults)
