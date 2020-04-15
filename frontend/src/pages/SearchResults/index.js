import React from 'react'
import PropTypes from 'prop-types'

import {
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardMedia,
  Grid,
  Typography,
  withStyles
} from '@material-ui/core'
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

const resultsInPage = 10

const Result = withStyles(resultStyle)(({ name, description, classes }) => (
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

const parseResults = results => {
  const components = []
  // eslint-disable-next-line no-control-regex
  const regex = /(?<Package>(?:Package: (?<PackageName>[a-z0-9.+-]+)\n)(?:Version: (?<PackageVersion>(?<PackageVersionEpoch>[0-9]{1,4}:)?(?<PackageVersionUpstream>[A-Za-z0-9~.]+)(?:-(?<PackageVersionDebian>[A-Za-z0-9~.]+))?)\n)?(?:Priority: (?<PackagePriority>\S+)\n)?(?:Section: (?<PackageSection>[a-z]+)\n)?(?:Source: (?<PackageSource>[a-zA-Z0-9-+.]+)\n)?(?:Maintainer: (?<PackageMaintainer>(?<PackageMaintainerName>(?:[\S ]+\S+)) <(?<PackageMaintanerEmail>(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\]))>)\n)?(?:Installed-Size: (?<PackageInstalledSize>.*)\n)(?:Provides: (?:(?:(?:[a-z0-9.+-]+(?: \((?:(?:<<|>>|<=|>=|=) (?:[0-9]{1,4}:)?(?:[A-Za-z0-9~.]+)(?:-(?:[A-Za-z0-9~.]+))?)\))?)(?:, )?))+\n)?(?:Pre-Depends: (?:(?:(?:[a-z0-9.+-]+(?: \((?:(?:<<|>>|<=|>=|=) (?:[0-9]{1,4}:)?(?:[A-Za-z0-9~.]+)(?:-(?:[A-Za-z0-9~.]+))?)\))?)(?:, )?))+\n)?(?:Depends: (?<PackageDepends>(?:(?:[a-z0-9.+-]+(?: \((?:(?:<<|>>|<=|>=|=) (?:[0-9]{1,4}:)?(?:[A-Za-z0-9~.]+)(?:-(?:[A-Za-z0-9~.]+))?)\))?)(?:, )?)+)\n)?(?:Recommends: (?<PackageRecommends>(?:(?:(?:[a-z0-9.+-]+(?: \((?:(?:<<|>>|<=|>=|=) (?:[0-9]{1,4}:)?(?:[A-Za-z0-9~.]+)(?:-(?:[A-Za-z0-9~.]+))?)\))?)(?:, )?))+)\n)?(?:Suggests: (?<PackageSuggests>(?:(?:(?:[a-z0-9.+-]+(?: \((?:(?:<<|>>|<=|>=|=) (?:[0-9]{1,4}:)?(?:[A-Za-z0-9~.]+)(?:-(?:[A-Za-z0-9~.]+))?)\))?)(?:, )?))+)\n)?(?:Conflicts: (?<PackageConflicts>(?:(?:(?:[a-z0-9.+-]+(?: \((?:(?:<<|>>|<=|>=|=) (?:[0-9]{1,4}:)?(?:[A-Za-z0-9~.]+)(?:-(?:[A-Za-z0-9~.]+))?)\))?)(?:, )?))+)\n)?(?:Enhances: (?<PackageEnhances>(?:(?:(?:[a-z0-9.+-]+(?: \((?:(?:<<|>>|<=|>=|=) (?:[0-9]{1,4}:)?(?:[A-Za-z0-9~.]+)(?:-(?:[A-Za-z0-9~.]+))?)\))?)(?:, )?))+)\n)?(?:Breaks: (?<PackageBreaks>(?:(?:(?:[a-z0-9.+-]+(?: \((?:(?:<<|>>|<=|>=|=) (?:[0-9]{1,4}:)?(?:[A-Za-z0-9~.]+)(?:-(?:[A-Za-z0-9~.]+))?)\))?)(?:, )?))+)\n)?(?:Replaces: (?<PackageReplaces>(?:(?:(?:[a-z0-9.+-]+(?: \((?:(?:<<|>>|<=|>=|=) (?:[0-9]{1,4}:)?(?:[A-Za-z0-9~.]+)(?:-(?:[A-Za-z0-9~.]+))?)\))?)(?:, )?))+)\n)?(?:Homepage: (?<PackageHomePage>https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&//=]*)\n))(?:Tag: (?<PackageTags>(?: ?[A-Za-z-+:]*(?:,(?: |\n)?)?)+)\n)?(?:Download-Size: (?<PackageDownloadSize>.*)\n)?(?:APT-Manual-Installed: (?<PackageAPTManualInstalled>.*)\n)?(?:APT-Sources: (?<PackageAPTSources>https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&//=]*)(?: (?:\S+ ?)+))\n)(?:Description: (?<PackageDescription>.*(?:\n \S.*)*)\n)?)/gm
  let match
  while ((match = regex.exec(results)) != null && components.length <= resultsInPage) {
    const { PackageName: name, PackageDescription: description } = match.groups
    components.push(
      <Result
        name={name}
        description={description.replace(/^ \./gm, '\n')}
        key={components.length}
      />
    )
  }
  return components
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
  }
}

const SearchResults = ({ classes }) => {
  const {
    state: { searchQuery, searchResult }
  } = useLocation()
  return (
    <div className={classes.root}>
      <h1>Showing results for {searchQuery}</h1>
      <Grid
        container
        direction='column'
        justify='space-evenly'
        alignItems='center'
        className={classes.grid}
      >
        {parseResults(searchResult)}
      </Grid>
    </div>
  )
}

if (process.env.node_env === 'development') {
  SearchResults.propTypes = {
    classes: PropTypes.object
  }
}

export default withStyles(styles)(SearchResults)
