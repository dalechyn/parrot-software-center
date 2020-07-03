import React, { ChangeEvent, useEffect, useState } from 'react'
import { connect, ConnectedProps } from 'react-redux'

import {
  CircularProgress,
  InputAdornment,
  makeStyles,
  TextField,
  Typography
} from '@material-ui/core'
import { Pagination } from '@material-ui/lab'
import { Search } from '@material-ui/icons'
import leven from 'leven'

import PackagePreviewList from '../../components/PackagePreviewList'
import { AptActions, AlertActions } from '../../actions'
import { unwrapResult } from '@reduxjs/toolkit'
import { RouteComponentProps, withRouter } from 'react-router-dom'
import { Preview } from '../../actions/apt'
import { Package } from '../PackageInfo'
import { replace } from 'connected-react-router'

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
  const [loading, setLoading] = useState(false)
  const [fulfilled, setFulfilled] = useState(false)
  const [previews, setPreviews] = useState(Array<Preview>())

  const { name: initialName, page: initialPage } = match.params
  const [name, setName] = useState(initialName)
  const [page, scroll] = useState(initialPage ? parseInt(initialPage) : 1)

  // Initial package names fetching effect
  useEffect(() => {
    if (!name) return
    let active = true
    scroll(1)
    const f = async () => {
      if (!active) return
      setLoading(true)
      try {
        setPreviews(
          unwrapResult(await searchPreviews(name)).sort(
            (a, b) => leven(a.name, name) - leven(b.name, name)
          )
        )
      } catch (e) {
        setAlert(e)
      }
      setLoading(false)
      setFulfilled(true)
    }

    f()
    return () => {
      active = false
    }
  }, [])

  const pageChange = (_: ChangeEvent<unknown>, n: number) => {
    if (n === page) return
    replace(`/search/${name}/${n}`)
    scroll(n)
  }
  const classes = useStyles()

  return (
    <div className={classes.root}>
      {loading ? (
        <CircularProgress className={classes.progress} />
      ) : (
        <>
          <TextField
            label="Search a package"
            variant="outlined"
            size="small"
            color="primary"
            value={name}
            onChange={({ target: { value } }) => {
              console.log(value)
              setName(value)
            }}
            onKeyPress={({ key }) => {
              const f = async () => {
                setLoading(true)
                try {
                  const previews = unwrapResult(await searchPreviews(name)).sort(
                    (a, b) => leven(a.name, name) - leven(b.name, name)
                  )
                  setPreviews(previews)
                } catch (e) {
                  setAlert(e)
                }
                setLoading(false)
                setFulfilled(true)
              }

              if (name.length > 2 && key == 'Enter') {
                scroll(1)
                f()
              }
            }}
            InputProps={{
              style: { borderRadius: 45 },
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              )
            }}
          />
          {fulfilled && previews.length === 0 ? (
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
        </>
      )}
    </div>
  )
}

export default connector(withRouter(SearchResults))
