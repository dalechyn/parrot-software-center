import React, { ChangeEvent, useEffect, useState } from 'react'
import { connect, ConnectedProps } from 'react-redux'

import { makeStyles } from '@material-ui/core'
import { Pagination } from '@material-ui/lab'
import leven from 'leven'

import PackagePreviewList from '../../components/PackagePreviewList'
import { AptActions, AlertActions } from '../../actions'
import { unwrapResult } from '@reduxjs/toolkit'
import { RouteComponentProps, withRouter } from 'react-router-dom'
import { Preview } from '../../actions/apt'
import { Package } from '../PackageInfo'

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
  search: AptActions.search
}

const connector = connect(mapStateToProps, mapDispatchToProps)

type SearchResultsProps = ConnectedProps<typeof connector> & RouteComponentProps

const SearchResults = ({
  setAlert,
  searchPreviews,
  match
}: SearchResultsProps & RouteComponentProps<Package & { page: string }>) => {
  const [previews, setPreviews] = useState(Array<Preview>())
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
          setPreviews(
            unwrapResult(response).sort((a, b) => leven(a.name, name) - leven(b.name, name))
          )
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
    scroll(n)
  }
  const classes = useStyles()

  return (
    <div className={classes.root}>
      <h1>Showing results for {name}</h1>
      <Pagination
        className={classes.pagination}
        count={Math.ceil(previews.length / componentsInPage)}
        onChange={pageChange}
        page={page}
        variant="outlined"
        shape="rounded"
      />
      <PackagePreviewList
        previews={previews.slice((page - 1) * componentsInPage, page * componentsInPage)}
      />
      <Pagination
        className={classes.pagination}
        count={Math.ceil(previews.length / componentsInPage)}
        onChange={pageChange}
        page={page}
        variant="outlined"
        shape="rounded"
      />
    </div>
  )
}

export default connector(withRouter(SearchResults))
