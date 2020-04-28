import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { useLocation } from 'react-router-dom'
import { Grid, makeStyles } from '@material-ui/core'
import { Pagination, Skeleton } from '@material-ui/lab'

import { formPackagePreviews } from './fetch'
import { bindActionCreators } from 'redux'
import { alertActions } from '../../actions'

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

const SearchResults = ({ setAlert }) => {
  const [resultsNames, setResultsNames] = useState([])
  const [packagePreviews, setPackagePreviews] = useState([])
  const [page, setPage] = useState(1)
  const {
    state: { searchQuery }
  } = useLocation()

  // Initial package names fetching effect
  useEffect(() => {
    let active = true
    const f = async () => {
      try {
        const res = await window.aptSearch(searchQuery)
        if (active) setResultsNames(res)
      } catch (e) {
        setAlert(e)
      }
    }

    f()
    return () => {
      active = false
    }
  }, [searchQuery])

  // Effect that sets package previews depending on selected page
  useEffect(() => {
    let active = true
    const f = async () => {
      try {
        const rawPackageData = await window.aptShow(
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
  }, [resultsNames, page])

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
    classes: PropTypes.object,
    setAlert: PropTypes.func
  }
}

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      setAlert: alertActions.set
    },
    dispatch
  )

export default connect(null, mapDispatchToProps)(SearchResults)
