import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'

import {
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CircularProgress,
  Grid,
  Typography,
  withStyles
} from '@material-ui/core'
import { Pagination } from '@material-ui/lab'
import { useLocation } from 'react-router-dom'

const resultStyle = {
  root: {
    maxWidth: '80vw',
    background: '#e6ffff'
  },
  media: {
    height: 140
  }
}

const componentsInPage = 5

const SearchQueryResult = withStyles(resultStyle)(({ name, description, classes }) => (
  <Card className={classes.root}>
    <CardActionArea>
      {/* <CardMedia
            className={classes.media}
            image='/static/images/cards/contemplative-reptile.jpg'
            title='Contemplative Reptile'
          /> */}
      <CardContent>
        <Typography gutterBottom variant='h5' component='h2'>
          {name}
        </Typography>
        <Typography variant='body2' color='textSecondary' component='p'>
          {description}
        </Typography>
      </CardContent>
    </CardActionArea>
    <CardActions>
      <Button size='small' color='primary'>
        Learn More
      </Button>
    </CardActions>
  </Card>
))

const pkgRegex = {
  required: {
    package: /^Package: ([a-z0-9.+-]+)/gm,
    version: /^Version: ((?<epoch>[0-9]{1,4}:)?(?<upstream>[A-Za-z0-9~.]+)(?:-(?<debian>[A-Za-z0-9~.]+))?)/gm,
    // eslint-disable-next-line no-control-regex
    maintainer: /^Maintainer: ((?<name>(?:[\S ]+\S+)) <(?<email>(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)]))>)/gm,
    description: /^Description: (.*(?:\n \S.*)*)/gm
  },
  optional: {
    section: /^Section: ([a-z]+)/gm,
    priority: /^Priority: (\S+)/gm,
    essential: /^Essential: (yes|no)/gm,
    architecture: /^Architecture: (.*)/gm,
    origin: /^Origin: ([a-z0-9.+-]+)/gm,
    bugs: /^Bugs: (?:([a-z]+):\/\/)[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*)/gm,
    homepage: /^Homepage: (?:([a-z]+):\/\/)[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*)/gm,
    tag: /^Tag: ((?: ?[A-Za-z-+:]*(?:,(?:[ \n])?)?)+)/gm,
    source: /^Source: ([a-zA-Z0-9-+.]+)/gm,
    depends: /^Depends: ((?:(?:(?:(?:[a-z0-9.+-]+(?: \((?:(?:<<|>>|<=|>=|=) (?:[0-9]{1,4}:)?(?:[A-Za-z0-9~.]+)(?:-(?:[A-Za-z0-9~.]+))?)\))?)(?:, )?)+)(?: \| )?)+)/gm,
    preDepends: /^Pre-Depends: ((?:(?:(?:(?:[a-z0-9.+-]+(?: \((?:(?:<<|>>|<=|>=|=) (?:[0-9]{1,4}:)?(?:[A-Za-z0-9~.]+)(?:-(?:[A-Za-z0-9~.]+))?)\))?)(?:, )?)+)(?: \| )?)+)/gm,
    recommends: /^Recommends: ((?:(?:(?:(?:[a-z0-9.+-]+(?: \((?:(?:<<|>>|<=|>=|=) (?:[0-9]{1,4}:)?(?:[A-Za-z0-9~.]+)(?:-(?:[A-Za-z0-9~.]+))?)\))?)(?:, )?)+)(?: \| )?)+)/gm,
    suggests: /^Suggests: ((?:(?:(?:(?:[a-z0-9.+-]+(?: \((?:(?:<<|>>|<=|>=|=) (?:[0-9]{1,4}:)?(?:[A-Za-z0-9~.]+)(?:-(?:[A-Za-z0-9~.]+))?)\))?)(?:, )?)+)(?: \| )?)+)/gm,
    breaks: /^Breaks: ((?:(?:[a-z0-9.+-]+(?: \((?:(?:<<|>>|<=|>=|=) (?:[0-9]{1,4}:)?(?:[A-Za-z0-9~.]+)(?:-(?:[A-Za-z0-9~.]+))?)\))?)(?:, )?)+)/gm,
    conflicts: /^Conflicts: ((?:(?:[a-z0-9.+-]+(?: \((?:(?:<<|>>|<=|>=|=) (?:[0-9]{1,4}:)?(?:[A-Za-z0-9~.]+)(?:-(?:[A-Za-z0-9~.]+))?)\))?)(?:, )?)+)/gm,
    replaces: /^Replaces: ((?:(?:[a-z0-9.+-]+(?: \((?:(?:<<|>>|<=|>=|=) (?:[0-9]{1,4}:)?(?:[A-Za-z0-9~.]+)(?:-(?:[A-Za-z0-9~.]+))?)\))?)(?:, )?)+)/gm,
    provides: /^Provides: ((?:(?:[a-z0-9.+-]+(?: \((?:(?:<<|>>|<=|>=|=) (?:[0-9]{1,4}:)?(?:[A-Za-z0-9~.]+)(?:-(?:[A-Za-z0-9~.]+))?)\))?)(?:, )?)+)/gm,
    installedSize: /^Installed-Size: (.*)/gm,
    downloadSize: /^Download-Size: (.*)/gm,
    aptManualInstalled: /^APT-Manual-Installed: (.*)/gm,
    aptSources: /^APT-Sources: (https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&\/=]*)(?: (?:\S+ ?)+))/gm
  }
}

const parseResults = str => {
  const searchQueryResults = str.split('\n\n')

  const parsedPackages = []
  for (let i = 0; i < searchQueryResults.length; i++) {
    const el = {}
    // Filling required fields
    if (
      !Object.keys(pkgRegex.required).every(key => {
        const match = pkgRegex.required[key].exec(searchQueryResults[i])
        if (match) el[key] = match[1]
        return match
      })
    ) {
      console.warn(`required fields are invalid, skipping invalid package`)
      continue
    }
    // Filling optional fields
    Object.keys(pkgRegex.required).forEach(key => {
      const match = pkgRegex.required[key].exec(searchQueryResults[i])
      if (match) el[key] = match[1]
      return match
    })

    parsedPackages.push(el)
  }

  return parsedPackages.map((pkg, i) => (
    <SearchQueryResult
      name={pkg.package}
      description={pkg.description.replace(/^ \./gm, '\n')}
      key={i}
    />
  ))
}

const styles = {
  root: {
    padding: '1rem'
  },
  grid: {
    display: 'inline-grid',
    gridAutoRows: 'min-content',
    gridGap: '1rem',
    alignItems: 'center',
    alignSelf: 'center'
  },
  pagination: {
    justifySelf: 'center'
  },
  progress: {
    justifySelf: 'center'
  }
}

const SearchResults = ({ classes }) => {
  const [result, setResult] = useState({ query: '', components: [] })
  const [page, setPage] = useState(1)
  const {
    state: { searchQuery, searchResult }
  } = useLocation()

  useEffect(() => {
    setResult({
      query: searchQuery,
      components: parseResults(searchResult)
    })
  }, [searchResult])

  return (
    <div className={classes.root}>
      <h1>Showing results for {result.query}</h1>
      {result.components.length === 0 ? (
        <CircularProgress className={classes.progress} />
      ) : (
        <Grid
          container
          direction='column'
          justify='space-evenly'
          alignItems='center'
          className={classes.grid}
        >
          {result.components.slice(page - 1, page - 1 + componentsInPage)}
          <Pagination
            className={classes.pagination}
            count={Math.ceil(result.components.length / componentsInPage)}
            onChange={(e, n) => {
              setPage(n)
            }}
            variant='outlined'
            shape='rounded'
          />
        </Grid>
      )}
    </div>
  )
}

if (process.env.node_env === 'development') {
  SearchResults.propTypes = {
    classes: PropTypes.object
  }
}

export default withStyles(styles)(SearchResults)
