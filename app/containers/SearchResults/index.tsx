import React, { ChangeEvent, useEffect, useState } from 'react'
import { connect, ConnectedProps } from 'react-redux'

import { Grid, makeStyles, Typography } from '@material-ui/core'
import { Pagination } from '@material-ui/lab'

import { AptActions, AlertActions } from '../../actions'
import { unwrapResult } from '@reduxjs/toolkit'
import { RouteComponentProps, withRouter } from 'react-router-dom'
import { replace } from 'connected-react-router'
import SearchField from '../../components/SearchField'
import { SearchPreview, SearchPreviewSkeleton } from '../../components'

const componentsInPage = 5

// Array.prototype.every iterates only on occupied elements, not all, so we have
// to check it out manually
const onlyNulls = (arr: Array<any>) => {
  for (const el of arr) if (el !== null) return false
  return true
}

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
  },
  previews
}: RootState) => ({
  ...state,
  previews
})

const mapDispatchToProps = {
  setAlert: AlertActions.set,
  fetchPreviews: AptActions.fetchPreviews,
  replace
}

const connector = connect(mapStateToProps, mapDispatchToProps)

type SearchResultsProps = ConnectedProps<typeof connector> &
  RouteComponentProps<{ name: string; page: string }>

const SearchResults = ({
  setAlert,
  fetchPreviews,
  match,
  replace,
  previews
}: SearchResultsProps) => {
  const [loading, setLoading] = useState(false)

  const { name: initialName, page: initialPage } = match.params
  const [page, scroll] = useState(initialPage ? parseInt(initialPage) : 1)
  const [length, setLength] = useState(0)

  // Initial package names fetching effect
  useEffect(() => {
    let active = true
    const f = async () => {
      if (!active) return
      try {
        setLength(unwrapResult(await fetchPreviews({ name: initialName, chunk: page })))
      } catch (e) {
        setAlert(e.message)
      }
      setLoading(false)
    }

    setLoading(true)
    f()
    return () => {
      active = false
    }
  }, [page])

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
                  setLength(unwrapResult(await fetchPreviews({ name, chunk: 1 })))
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
      {!loading && previews.length === 5 && onlyNulls(previews) ? (
        <Typography variant="h6">Nothing found...</Typography>
      ) : (
        <>
          <Pagination
            className={classes.pagination}
            count={Math.ceil(length / componentsInPage)}
            onChange={pageChange}
            page={page}
            variant="outlined"
            shape="rounded"
          />
          <Grid
            container
            direction="column"
            justify="space-evenly"
            alignItems="center"
            className={classes.grid}
          >
            {previews[0] ? (
              <SearchPreview {...previews[0]} />
            ) : (
              previews[0] === undefined && <SearchPreviewSkeleton />
            )}
            {previews[1] ? (
              <SearchPreview {...previews[1]} />
            ) : (
              previews[1] === undefined && <SearchPreviewSkeleton />
            )}
            {previews[2] ? (
              <SearchPreview {...previews[2]} />
            ) : (
              previews[2] === undefined && <SearchPreviewSkeleton />
            )}
            {previews[3] ? (
              <SearchPreview {...previews[3]} />
            ) : (
              previews[3] === undefined && <SearchPreviewSkeleton />
            )}
            {previews[4] ? (
              <SearchPreview {...previews[4]} />
            ) : (
              previews[4] === undefined && <SearchPreviewSkeleton />
            )}
          </Grid>
          <Pagination
            className={classes.pagination}
            count={Math.ceil(length / componentsInPage)}
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
