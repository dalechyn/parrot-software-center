import React, { useState } from 'react'
import classnames from 'classnames'

import { connect, ConnectedProps } from 'react-redux'
import { Img } from 'react-image'
import { push } from 'connected-react-router'
import { useSnackbar } from 'notistack'

import {
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  makeStyles,
  Paper,
  Typography
} from '@material-ui/core'
import { amber, blue, grey, orange, red } from '@material-ui/core/colors'
import { QueueActions } from '../../actions'
import { QueueNode } from '../../containers/Queue'
import { Rating } from '@material-ui/lab'
import { PackagePreview } from '../../actions/apt'
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles(theme => ({
  root: {
    width: '80vw'
  },
  description: {
    whiteSpace: 'pre-wrap',
    paddingTop: theme.spacing(2)
  },
  media: {
    height: 40,
    width: 40
  },
  header: {
    padding: theme.spacing(2),
    display: 'flex',
    flexFlow: 'column'
  },
  nameHolder: {
    display: 'flex',
    alignItems: 'center'
  },
  cve: {
    display: 'grid',
    gridAutoFlow: 'column',
    alignItems: 'center',
    gridGap: theme.spacing(1),
    paddingTop: theme.spacing(1),
    marginLeft: 'auto'
  },
  buttonsHolder: {
    justifyContent: 'flex-end'
  },
  cveCritical: {
    background: red[500]
  },
  cveHigh: {
    background: orange[500]
  },
  cveMedium: {
    background: amber[500]
  },
  name: {
    paddingLeft: theme.spacing(1)
  },
  source: {
    color: grey[500],
    marginLeft: theme.spacing(2)
  },
  chipText: {
    color: grey[900]
  },
  install: {
    color: '#2196f3',
    borderColor: '#2196f3'
  },
  uninstall: {
    color: '#f44336',
    borderColor: '#f44336'
  },
  upgrade: {
    color: '#4caf50',
    borderColor: '#4caf50'
  }
}))

const mapStateToProps = ({ queue: { packages, isBusy }, settings: { APIUrl } }: RootState) => ({
  packages,
  isBusy,
  APIUrl
})

const mapDispatchToProps = {
  push,
  install: QueueActions.install,
  uninstall: QueueActions.uninstall,
  upgrade: QueueActions.upgrade,
  dontUpgrade: QueueActions.dontUpgrade
}

const connector = connect(mapStateToProps, mapDispatchToProps)

type SearchPreviewProps = ConnectedProps<typeof connector> & PackagePreview

const SearchPreview = ({
  name,
  version,
  description,
  packageSource,
  push,
  install,
  uninstall,
  upgrade,
  dontUpgrade,
  packages,
  cveInfo,
  upgradable,
  installed,
  icon,
  rating,
  isBusy,
  upgradeQueued,
  APIUrl
}: SearchPreviewProps) => {
  const classes = useStyles()
  const { enqueueSnackbar } = useSnackbar()

  const [installedOrQueried, setInstalled] = useState(installed)
  const [queuedUpgrade, setQueuedUpgrade] = useState(upgradeQueued)

  const { t } = useTranslation();

  return (
    <Grid item>
      <Card className={classes.root}>
        <CardActionArea
          onClick={() =>
            push(packageSource === 'APT' ? `/package/apt/${name}` : `/package/snap/${name}`)
          }
        >
          <CardContent>
            <Paper className={classes.header} elevation={10}>
              <div className={classes.nameHolder}>
                <Img
                  className={classes.media}
                  src={`${APIUrl}/assets/packages/${name}.png`}
                  unloader={<img className={classes.media} src={icon} alt={`${t('noPkgFound')}`} />}
                />
                <Typography className={classes.name} variant="h5">
                  {name}
                </Typography>
                <Typography variant="h5">@</Typography>
                <Typography style={{ color: blue[400] }} variant="h5">
                  {packageSource === 'APT' ? version : version.split(':')[1]}
                </Typography>
                <Typography className={classes.source} variant="body2">
                  {packageSource}
                </Typography>
                {rating === -1 ? (
                  <CircularProgress style={{ marginLeft: 'auto' }} />
                ) : (
                  <Rating readOnly value={rating} style={{ marginLeft: 'auto' }} />
                )}
              </div>
              {cveInfo && (
                <div className={classes.cve}>
                  {(cveInfo.critical != 0 ||
                    cveInfo.high != 0 ||
                    cveInfo.medium != 0 ||
                    cveInfo.low != 0) && (
                    <>
                      <Chip label={`${t('monthCVEs')}:`} />
                      {cveInfo.critical != 0 && (
                        <Chip
                          className={classnames(classes.cveCritical, classes.chipText)}
                          label={`${t('critical')}: ${cveInfo.critical}`}
                        />
                      )}
                      {cveInfo.high != 0 && (
                        <Chip
                          className={classnames(classes.cveHigh, classes.chipText)}
                          label={`${t('high')}: ${cveInfo.high}`}
                        />
                      )}
                      {cveInfo.medium != 0 && (
                        <Chip
                          className={classnames(classes.cveMedium, classes.chipText)}
                          label={`${t('medium')}: ${cveInfo.medium}`}
                        />
                      )}
                      {cveInfo.low != 0 && <Chip label={`${t('low')}: ${cveInfo.low}`} />}
                    </>
                  )}
                </div>
              )}
            </Paper>
            <Typography
              className={classes.description}
              variant="body1"
              color="textSecondary"
              component="p"
              noWrap
            >
              {description}
            </Typography>
          </CardContent>
        </CardActionArea>
        <CardActions className={classes.buttonsHolder}>
          {upgradable &&
            (queuedUpgrade ? (
              <Button
                classes={{ outlined: classes.uninstall }}
                disabled={isBusy}
                onClick={() => {
                  enqueueSnackbar(`${t('package')} ${name} ${t('dequeued')}`, {
                    variant: 'error'
                  })
                  dontUpgrade({ name, version, source: packageSource })
                  setQueuedUpgrade(false)
                }}
                variant="outlined"
                size="medium"
              >
                ${t('cancelUpgrade')}
              </Button>
            ) : (
              <Button
                classes={{ outlined: classes.upgrade }}
                disabled={isBusy}
                onClick={() => {
                  enqueueSnackbar(`${t('package')} ${name} ${t('queuedUpgrade')}`, {
                    variant: 'success'
                  })
                  upgrade({ name, version, source: packageSource })
                  setQueuedUpgrade(true)
                }}
                variant="outlined"
                size="medium"
              >
                {t('upgradePkg')}
              </Button>
            ))}

          {installedOrQueried ? (
            <Button
              classes={{ outlined: classes.uninstall }}
              disabled={isBusy}
              onClick={() => {
                enqueueSnackbar(
                  packages.find((el: QueueNode) => el.name === name)
                    ? `${t('package')} ${name} ${t('dequeued')}`
                    : `${t('package')} ${name} ${t('queuedDel')}`,
                  {
                    variant: 'error'
                  }
                )
                uninstall({ name, version, source: packageSource })
                setInstalled(false)
              }}
              variant="outlined"
              size="medium"
            >
              {t('uninstall')}
            </Button>
          ) : (
            <Button
              classes={{ outlined: classes.install }}
              disabled={isBusy}
              onClick={() => {
                enqueueSnackbar(
                  packages.find((el: QueueNode) => el.name === name)
                    ? `${t('package')} ${name} ${t('dequeued')}`
                    : `${t('package')} ${name} ${t('queuedInst')}`,
                  {
                    variant: 'info'
                  }
                )
                install({ name, version, source: packageSource })
                setInstalled(true)
              }}
              variant="outlined"
              size="medium"
            >
              {t('install')}
            </Button>
          )}
        </CardActions>
      </Card>
    </Grid>
  )
}

export default connector(SearchPreview)
