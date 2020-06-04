import { PackagePreview, PackagePreviewSkeleton } from '../index'
import React, { ReactNode, useEffect, useMemo, useState } from 'react'
import { AlertActions, AptActions } from '../../actions'
import { connect, ConnectedProps } from 'react-redux'
import { Grid, makeStyles } from '@material-ui/core'
import { Preview } from '../../actions/apt'

const APIUrl = 'http://localhost:8000/'

export interface CVEInfoType {
  critical: number
  important: number
  low: number
}

const cveAPIInfo = {
  api: 'http://cve.circl.lu/api/search/',
  handleResult: (json: CVEInfoType) => json
}

const mapDispatchToProps = {
  status: AptActions.status,
  search: AptActions.search,
  alert: AlertActions.set
}

const connector = connect(null, mapDispatchToProps)

type PackagePreviewListProps = ConnectedProps<typeof connector> & {
  previews: Preview[]
}

const useStyles = makeStyles(theme => ({
  grid: {
    display: 'inline-grid',
    gridGap: theme.spacing(2)
  }
}))

const PackagePreviewList = ({ previews }: PackagePreviewListProps) => {
  const [previewNodes, setPreviewNodes] = useState(Array<ReactNode>())
  const classes = useStyles()

  const resourceURL = useMemo(() => new URL('assets/packages/', APIUrl).toString(), [])

  useEffect(() => {
    setPreviewNodes([])
    const f = async () => {
      setPreviewNodes(
        await Promise.all(
          previews.map(async ({ name, description }) => {
            const cveInfo = await cveAPIInfo.handleResult({
              critical: 3,
              important: 41,
              low: 412
            })
            return (
              <PackagePreview
                name={name}
                description={description}
                key={`${name}`}
                imageUrl={`${resourceURL}${name}.png`}
                cveInfo={cveInfo}
              />
            )
          })
        )
      )
    }
    f()
  }, [previews])

  return (
    <Grid
      container
      direction="column"
      justify="space-evenly"
      alignItems="center"
      className={classes.grid}
    >
      {previewNodes.length === 0 ? (
        <>
          <PackagePreviewSkeleton />
          <PackagePreviewSkeleton />
          <PackagePreviewSkeleton />
          <PackagePreviewSkeleton />
          <PackagePreviewSkeleton />
        </>
      ) : (
        previewNodes
      )}
    </Grid>
  )
}

export default connector(PackagePreviewList)
