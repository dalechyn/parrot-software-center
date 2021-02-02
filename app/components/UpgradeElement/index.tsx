import { QueueNodeMeta, upgrade } from '../../actions/queue'
import { Button, Grid, Hidden, makeStyles, Paper, Typography } from '@material-ui/core'
import { Img } from 'react-image'
import dummyPackageImg from '../../assets/package.png'
import React from 'react'
import { useSnackbar } from 'notistack'
import { useTranslation } from 'react-i18next'
import { push } from 'connected-react-router'
import { connect, ConnectedProps } from 'react-redux'

const useStyles = makeStyles(theme => ({
  card: {
    padding: theme.spacing(2)
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff'
  },
  gridItem: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1)
  },
  metaHolder: {
    display: 'flex'
  },
  pkgName: {
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2)
  },
  media: {
    height: 30,
    width: 30,
    marginTop: 'auto',
    marginBottom: 'auto',
    marginRight: theme.spacing(2)
  },
  upgrade: {
    marginTop: theme.spacing(1),
    color: '#4caf50',
    borderColor: '#4caf50'
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

type UpgradeElementProps = {
  removeFunction: () => void
} & QueueNodeMeta &
  ConnectedProps<typeof connector>

const UpgradeElement = ({
  name,
  source,
  oldVersion,
  version,
  removeFunction,
  isBusy,
  push,
  upgrade
}: UpgradeElementProps) => {
  const classes = useStyles()
  const { enqueueSnackbar } = useSnackbar()
  const { t } = useTranslation()

  return (
    <Grid item style={{ width: '100%' }}>
      <Paper className={classes.card}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
          <Grid className={classes.gridItem} item xs={8} md={6}>
            <div className={classes.metaHolder}>
              <Img className={classes.media} src={dummyPackageImg} />
              <Typography variant="h5" noWrap className={classes.pkgName}>
                {name}
              </Typography>
            </div>
          </Grid>
          <Hidden smDown>
            <Grid className={classes.gridItem} item xs={3} lg={4}>
              <Typography variant="h5">{version}</Typography>
            </Grid>
            <Grid className={classes.gridItem} item xs={3} lg={4}>
              <Typography variant="h6">
                {t('from')} {oldVersion}
              </Typography>
            </Grid>
          </Hidden>
          <Grid className={classes.gridItem} item container xs={3} lg={4} justify="flex-end">
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
                  removeFunction()
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
}

export default connector(UpgradeElement)
