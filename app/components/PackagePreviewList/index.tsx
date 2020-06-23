import { PackagePreview } from '../index'
import React, { ReactNode, useEffect, useState } from 'react'
import { Grid, makeStyles } from '@material-ui/core'
import { Preview } from '../../actions/apt'

export interface CVEInfoType {
  critical: number
  important: number
  low: number
}

const cveAPIInfo = {
  api: 'http://cve.circl.lu/api/search/',
  handleResult: (json: CVEInfoType) => json
}

type PackagePreviewListProps = {
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
                imageUrl={`${APIUrl}/assets/packages/${name}.png`}
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
      {previewNodes}
    </Grid>
  )
}

export default PackagePreviewList
