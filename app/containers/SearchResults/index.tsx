import React, { ChangeEvent, useEffect, useState } from 'react'
import { connect, ConnectedProps } from 'react-redux'

import { Grid, makeStyles } from '@material-ui/core'
import { Pagination } from '@material-ui/lab'
import leven from 'leven'

import PackagePreviewList from '../../components/PackagePreviewList'
import { AptActions, AlertActions } from '../../actions'
import { unwrapResult } from '@reduxjs/toolkit'
import { RouteComponentProps, withRouter } from 'react-router-dom'
import { Preview } from '../../actions/apt'
import { Package } from '../PackageInfo'
import { replace } from 'connected-react-router'
import { PackagePreviewSkeleton } from '../../components'

const componentsInPage = 5

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexFlow: 'column',
    padding: theme.spacing(3)
  },
  progress: {
    alignSelf: 'center'
  },
  pagination: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    marginLeft: 'auto',
    marginRight: 'auto'
  },
  grid: {
    display: 'inline-grid',
    gridGap: theme.spacing(2)
  }
}))

const mapStateToProps = ({
  router: {
    location: { state }
  }
}: RootState) => ({
  ...state
})

const mapDispatchToProps = {
  setAlert: AlertActions.set,
  searchPreviews: AptActions.searchPreviews,
  search: AptActions.search,
  replace
}

const connector = connect(mapStateToProps, mapDispatchToProps)

type SearchResultsProps = ConnectedProps<typeof connector> & RouteComponentProps

const SearchResults = ({
  setAlert,
  searchPreviews,
  match,
  replace
}: SearchResultsProps & RouteComponentProps<Package & { page: string }>) => {
  const [previews, setPreviews] = useState(Array<Preview>())
  const [loaded, setLoaded] = useState(false)

  const { name, page: initialPage } = match.params
  const [page, scroll] = useState(initialPage ? parseInt(initialPage) : 1)

  // Initial package names fetching effect
  useEffect(() => {
    if (!name) return
    let active = true
    const f = async () => {
      try {
        const response = await searchPreviews(name)
        if (active && AptActions.searchPreviews.fulfilled.match(response)) {
          try {
            setPreviews(
              unwrapResult(response).sort((a, b) => leven(a.name, name) - leven(b.name, name))
            )
            setLoaded(true)
          } catch (e) {
            setAlert(e)
          }
        }
      } catch (e) {
        setAlert(e)
      }
    }

    f()
    return () => {
      active = false
    }
  }, [name, setAlert])

  const pageChange = (_: ChangeEvent<unknown>, n: number) => {
    if (n === page) return
    replace(`/search/${name}/${n}`)
    scroll(n)
  }
  const classes = useStyles()

  return (
    <div className={classes.root}>
      <h1>Showing results for {name}</h1>
      {!loaded ? (
        <Grid
          container
          direction="column"
          justify="space-evenly"
          alignItems="center"
          className={classes.grid}
        >
          <PackagePreviewSkeleton />
          <PackagePreviewSkeleton />
          <PackagePreviewSkeleton />
          <PackagePreviewSkeleton />
          <PackagePreviewSkeleton />
        </Grid>
      ) : previews.length === 0 ? (
        <h2>Nothing found...</h2>
      ) : (
        <Pagination
          className={classes.pagination}
          count={Math.ceil(previews.length / componentsInPage)}
          onChange={pageChange}
          page={page}
          variant="outlined"
          shape="rounded"
        />
      )}
      <PackagePreviewList
        previews={previews.slice((page - 1) * componentsInPage, page * componentsInPage)}
      />
      {previews.length !== 0 && (
        <Pagination
          className={classes.pagination}
          count={Math.ceil(previews.length / componentsInPage)}
          onChange={pageChange}
          page={page}
          variant="outlined"
          shape="rounded"
        />
      )}
    </div>
  )
}

export default connector(withRouter(SearchResults))
