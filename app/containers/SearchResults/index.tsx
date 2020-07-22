import React, { ChangeEvent, useEffect, useState } from 'react'
import { connect, ConnectedProps } from 'react-redux'

import { Grid, makeStyles, Typography } from '@material-ui/core'
import { Pagination } from '@material-ui/lab'
import leven from 'leven'

import PackagePreviewList from '../../components/PackagePreviewList'
import { AptActions, AlertActions } from '../../actions'
import { unwrapResult } from '@reduxjs/toolkit'
import { RouteComponentProps, withRouter } from 'react-router-dom'
import { Preview } from '../../actions/apt'
import { Package } from '../PackageInfo'
import { replace } from 'connected-react-router'
import SearchField from '../../components/SearchField'

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

type SearchResultsProps = ConnectedProps<typeof connector> &
  RouteComponentProps<Package & { page: string }>

const SearchResults = ({ setAlert, searchPreviews, match, replace }: SearchResultsProps) => {
  const [loading, setLoading] = useState(false)
  const [previews, setPreviews] = useState(Array<Preview>())

  const { name: initialName, page: initialPage } = match.params
  const [page, scroll] = useState(initialPage ? parseInt(initialPage) : 1)

  // Initial package names fetching effect
  useEffect(() => {
    let active = true
    if (page !== 1) scroll(1)
    const f = async () => {
      if (!active) return
      try {
        setPreviews(
          unwrapResult(await searchPreviews(initialName)).sort(
            (a, b) => leven(a.name, initialName) - leven(b.name, initialName)
          )
        )
      } catch (e) {
        setAlert(e)
      }
      setLoading(false)
    }

    setLoading(true)
    f()
    return () => {
      active = false
    }
  }, [])

  const pageChange = (_: ChangeEvent<unknown>, n: number) => {
    if (n === page) return
    replace(`/search/${initialName}/${n}`)
    scroll(n)
  }
  const classes = useStyles()

  return (
    <section className={classes.root}>
      <Grid container justify="center">
        <Grid item xs={6}>
          <SearchField
            query={initialName}
            onEnter={name => {
              const f = async () => {
                // TimedOut error should be handled here
                try {
                  const previews = unwrapResult(await searchPreviews(name)).sort(
                    (a, b) => leven(a.name, name) - leven(b.name, name)
                  )
                  setPreviews(previews)
                } catch (e) {
                  setAlert(e)
                }
                setLoading(false)
              }

              if (name.length > 2) {
                if (page !== 1) scroll(1)
                replace(`/search/${name}/1`)
                setLoading(true)
                f()
              }
            }}
          />
        </Grid>
      </Grid>
      {!loading && previews.length === 0 ? (
        <Typography variant="h6">Nothing found...</Typography>
      ) : (
        <>
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
        </>
      )}
    </section>
  )
}

export default connector(withRouter(SearchResults))
