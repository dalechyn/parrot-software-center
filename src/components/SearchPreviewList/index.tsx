import React, { ReactNode, useEffect, useState } from 'react'
import { Grid, makeStyles } from '@material-ui/core'
import { SearchPreview, SearchPreviewSkeleton } from '../index'
import { PackagePreview } from '../../types/apt'

export interface CVEInfoType {
  low: number
  medium: number
  high: number
  critical: number
}

export interface CVEEndpoint {
  api: string
  handleResponse: (res: Response) => Promise<CVEInfoType>
}

type SearchPreviewListProps = {
  previews: PackagePreview[]
}

const useStyles = makeStyles(theme => ({
  grid: {
    display: 'inline-grid',
    gridGap: theme.spacing(2)
  }
}))

const SearchPreviewList = ({ previews }: SearchPreviewListProps) => {
  const [loaded, setLoaded] = useState(false)
  const [previewNodes, setPreviewNodes] = useState(Array<ReactNode>())
  const classes = useStyles()

  useEffect(() => {
    setPreviewNodes([])
    setLoaded(false)
    setPreviewNodes(previews.map(p => <SearchPreview key={p.name} {...p} />))
    setLoaded(true)
  }, [previews])

  return loaded ? (
    <Grid
      container
      direction="column"
      justify="space-evenly"
      alignItems="center"
      className={classes.grid}
    >
      {previewNodes}
    </Grid>
  ) : (
    <Grid
      container
      direction="column"
      justify="space-evenly"
      alignItems="center"
      className={classes.grid}
    >
      <SearchPreviewSkeleton />
      <SearchPreviewSkeleton />
      <SearchPreviewSkeleton />
      <SearchPreviewSkeleton />
      <SearchPreviewSkeleton />
    </Grid>
  )
}

export default SearchPreviewList
