import React, { useState } from 'react'
import { QueueNodeMeta } from '../../actions/queue'
import { Grid, Paper, Typography, Link, makeStyles, IconButton } from '@material-ui/core'
import { NavigateNext, ExpandMore, ExpandLess, MoreHoriz } from '@material-ui/icons'
import { Img } from 'react-image'
import { push } from 'connected-react-router'
import dummyPackageImg from '../../assets/package.png'
import { connect, ConnectedProps } from 'react-redux'
import { RouteComponentProps, withRouter } from 'react-router'

const useStyles = makeStyles(theme => ({
  media: {
    height: 60,
    width: 60,
    marginRight: theme.spacing(2)
  },
  detailsLink: {
    marginRight: theme.spacing(2)
  },
  pkgName: {
    whiteSpace: 'nowrap',
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2)
  }
}))

const mapStateToProps = ({ settings: { APIUrl } }: RootState) => ({
  APIUrl
})

const mapDispatchToProps = {
  push
}

const connector = connect(mapStateToProps, mapDispatchToProps)

export type UpdateListInpuProp = {
  updates: QueueNodeMeta[]
}
type UpdateListProp = ConnectedProps<typeof connector> & RouteComponentProps & UpdateListInpuProp

const UpdateList = ({ updates, push, APIUrl }: UpdateListProp) => {
  const classes = useStyles()
  const [isExpanded, expand] = useState(false)
  const maxItemsShown = 10
  const areUpdatesMoreThanMaxItems = updates.length > maxItemsShown
  return (
    <>
      {areUpdatesMoreThanMaxItems ? (
        <div style={{ float: 'right' }}>
          <IconButton onClick={() => expand(!isExpanded)} aria-label="collapse/expande">
            {isExpanded ? <ExpandLess></ExpandLess> : <ExpandMore></ExpandMore>}
          </IconButton>
        </div>
      ) : undefined}
      <div style={{ flexGrow: 1 }}>
        <Grid container spacing={3}>
          {updates
            .slice(0, isExpanded ? updates.length : maxItemsShown)
            .map(({ name, source }, index) => {
              return (
                <Grid item key={index}>
                  <Paper style={{ display: 'flex', alignItems: 'center' }}>
                    <Img
                      className={classes.media}
                      src={`${APIUrl}/assets/packages/${name}.png`}
                      unloader={
                        <img
                          className={classes.media}
                          src={dummyPackageImg}
                          alt={'No Package Found'}
                        />
                      }
                    />
                    <Typography variant="h5" className={classes.pkgName}>
                      {name}
                    </Typography>
                    <Link
                      component="button"
                      variant="body1"
                      onClick={() => push(`/package/${source === 'APT' ? 'apt' : 'snap'}/${name}`)}
                      className={classes.detailsLink}
                    >
                      <NavigateNext fontSize="large" style={{ cursor: 'pointer' }} />
                    </Link>
                  </Paper>
                </Grid>
              )
            })}
          {!isExpanded && areUpdatesMoreThanMaxItems ? (
            <IconButton
              style={{ borderRadius: '4px' }}
              onClick={() => expand(!isExpanded)}
              aria-label="collapse"
            >
              <MoreHoriz></MoreHoriz>
            </IconButton>
          ) : undefined}
        </Grid>
      </div>
    </>
  )
}

export default connector(withRouter(UpdateList))
