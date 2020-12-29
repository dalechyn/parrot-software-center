import React, { useState } from 'react'
import { QueueNodeMeta, upgrade } from '../../actions/queue'
import { Grid, Paper, Typography, makeStyles, IconButton, Button, Hidden } from '@material-ui/core'
import { ExpandMore, ExpandLess, MoreHoriz } from '@material-ui/icons'
import { Img } from 'react-image'
import { push } from 'connected-react-router'
import dummyPackageImg from '../../assets/package.png'
import { connect, ConnectedProps } from 'react-redux'
import { RouteComponentProps, withRouter } from 'react-router'
import { useSnackbar } from 'notistack'
import cls from 'classnames'
import { useTranslation } from 'react-i18next'

const useStyles = makeStyles(theme => ({
  card: {
    padding: theme.spacing(2)
  },
  media: {
    height: 30,
    width: 30,
    marginTop: 'auto',
    marginBottom: 'auto',
    marginRight: theme.spacing(2)
  },
  detailsLink: {
    marginRight: theme.spacing(2)
  },
  pkgName: {
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2)
  },
  versionHolder: {
    display: 'flex'
  },
  metaHolder: {
    display: 'flex'
  },
  upgrade: {
    marginTop: theme.spacing(1),
    color: '#4caf50',
    borderColor: '#4caf50'
  },
  gridItem: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1)
  },
  expanded: {
    display: 'inline-block'
  },
  notExpanded: {
    display: 'none'
  }
}))

const mapStateToProps = ({ queue: { isBusy } }: RootState) => ({
  isBusy
})

const mapDispatchToProps = {
  push,
  upgrade
}

const connector = connect(mapStateToProps, mapDispatchToProps)

export type UpdateListInputProp = {
  updates: QueueNodeMeta[]
}
type UpdateListProp = ConnectedProps<typeof connector> & RouteComponentProps & UpdateListInputProp

const UpdateList = ({ updates, push, upgrade, isBusy }: UpdateListProp) => {
  const classes = useStyles()
  const { enqueueSnackbar } = useSnackbar()
  const [isExpanded, expand] = useState(false)
  const maxItemsShown = 10
  const areUpdatesMoreThanMaxItems = updates.length > maxItemsShown
  const { t } = useTranslation()

  const metaToComponent = ({ name, source, oldVersion, version }: QueueNodeMeta, index: number) => (
    <Grid item key={index} style={{ width: '100%' }}>
      <Paper className={classes.card}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
          <Grid className={classes.gridItem} item xs={8} md={4}>
            <div className={classes.metaHolder}>
              <Img className={classes.media} src={dummyPackageImg} />
              <Typography variant="h5" noWrap className={classes.pkgName}>
                {name}
              </Typography>
            </div>
          </Grid>
          <Hidden smDown>
            <Grid className={classes.gridItem} item xs={4}>
              <Typography variant="h5">{version}</Typography>
            </Grid>
            <Grid className={classes.gridItem} item xs={4}>
              <Typography variant="h6">
                {t('from')} {oldVersion}
              </Typography>
            </Grid>
          </Hidden>
          <Grid className={classes.gridItem} item container xs={4} md={4} justify="flex-end">
            <div style={{ display: 'flex', flexFlow: 'column' }}>
              <Button
                variant="outlined"
                color="primary"
                size="large"
                onClick={() => push(`/package/${source === 'APT' ? 'apt' : 'snap'}/${name}`)}
              >
                {t('moreInfo')}
              </Button>
              <Button
                variant="outlined"
                disabled={isBusy}
                color="primary"
                className={classes.upgrade}
                size="large"
                onClick={() => {
                  enqueueSnackbar(`${t('package')} ${name}@${version} ${t('queueUpgrade')}`, {
                    variant: 'success'
                  })
                  upgrade({ name, version, source: 'APT' })
                }}
              >
                {t('upgradePkg')}
              </Button>
            </div>
          </Grid>
        </div>
      </Paper>
    </Grid>
  )

  const updateComponents = updates.map((meta, index) => metaToComponent(meta, index))

  return (
    <>
      {areUpdatesMoreThanMaxItems ? (
        <div style={{ float: 'right' }}>
          <IconButton onClick={() => expand(!isExpanded)} aria-label="collapse/expanded">
            {isExpanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </div>
      ) : undefined}
      <>
        <Grid container spacing={3} direction="column">
          {updateComponents.slice(0, maxItemsShown)}
        </Grid>
        <Grid
          className={cls(isExpanded ? classes.expanded : classes.notExpanded)}
          container
          direction="column"
          spacing={3}
          style={{ marginTop: 0 }}
        >
          {updateComponents.slice(maxItemsShown)}
        </Grid>
        {!isExpanded && areUpdatesMoreThanMaxItems ? (
          <IconButton
            style={{ borderRadius: '4px' }}
            onClick={() => expand(!isExpanded)}
            aria-label="collapse"
          >
            <MoreHoriz />
          </IconButton>
        ) : null}
      </>
    </>
  )
}

export default connector(withRouter(UpdateList))
