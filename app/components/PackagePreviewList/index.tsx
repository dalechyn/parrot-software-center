import { PackagePreview, PackagePreviewSkeleton } from '../index'
import React, { ReactNode, useEffect, useState } from 'react'
import { Grid, makeStyles } from '@material-ui/core'
import { Preview } from '../../actions/apt'

const APIUrl = 'http://localhost:8000'

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

const redhatCVEEndpoint: CVEEndpoint = {
  api: 'https://access.redhat.com/hydra/rest/securitydata/cve.json?',
  handleResponse: async (res: Response) => {
    let low = 0
    let medium = 0
    let high = 0
    let critical = 0

    const json = await res.json()
    console.log(json)

    if (Array.isArray(json))
      // eslint-disable-next-line @typescript-eslint/camelcase
      json.forEach(({ cvss3_score: score }) => {
        if (score >= 0 && score < 4) low++
        else if (score < 7) medium++
        else if (score < 9) high++
        else critical++
      })

    return { low, medium, high, critical }
  }
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
  const [loaded, setLoaded] = useState(false)
  const [previewNodes, setPreviewNodes] = useState(Array<ReactNode>())
  const classes = useStyles()

  useEffect(() => {
    setPreviewNodes([])
    setLoaded(false)
    const f = async () => {
      const monthAgo = new Date()
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      setPreviewNodes(
        await Promise.all(
          previews.map(async ({ name, description }) => {
            console.log(`${redhatCVEEndpoint.api}package=${name}&after=${monthAgo.toISOString()}`)
            const cveInfo = await redhatCVEEndpoint.handleResponse(
              await fetch(
                `${redhatCVEEndpoint.api}package=${name}&after=${monthAgo.toISOString()}`,
                {
                  method: 'GET'
                }
              )
            )
            return (
              <PackagePreview
                name={name}
                description={description}
                key={name}
                imageUrl={`${APIUrl}/assets/packages/${name}.png`}
                cveInfo={cveInfo}
              />
            )
          })
        )
      )
      setLoaded(true)
    }
    f()
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
      <PackagePreviewSkeleton />
      <PackagePreviewSkeleton />
      <PackagePreviewSkeleton />
      <PackagePreviewSkeleton />
      <PackagePreviewSkeleton />
    </Grid>
  )
}

export default PackagePreviewList
