import React, { useEffect, useState } from 'react'
import classnames from 'classnames'

import { RootAction, RootState } from 'typesafe-actions'
import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'
import Img from 'react-image'
import { Push, push } from 'connected-react-router'
import { useSnackbar } from 'notistack'
import { Package } from '../../pages/SearchResults/fetch'

import {
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  Chip,
  Paper,
  Typography,
  makeStyles
} from '@material-ui/core'
import { grey, red, orange } from '@material-ui/core/colors'
import dummyPackageImg from '../../assets/package.png'
import { QueueActions } from '../../actions'

const maxDescriptionLength = 500

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
    display: 'inline-grid',
    gridTemplateColumns: 'auto auto auto auto',
    alignItems: 'center',
    gridGap: theme.spacing(1),
    paddingTop: theme.spacing(1),
    marginLeft: 'auto'
  },
  buttons: {
    justifyContent: 'flex-end'
  },
  cveCritical: {
    background: red[500]
  },
  cveImportant: {
    background: orange[500]
  },
  name: {
    paddingLeft: theme.spacing(1)
  },
  chipText: {
    color: grey[900]
  }
}))

type PackagePreviewProps = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  ReturnType<Push> & {
    imageUrl: string
    name: string
    description: string
    version: string
    installed: boolean
    cveInfo: {
      critical: number
      important: number
      low: number
    }
  }

const PackagePreview = ({
  imageUrl,
  name,
  description,
  version,
  push,
  install,
  uninstall,
  queue,
  cveInfo,
  installed,
  ...rest
}: PackagePreviewProps) => {
  const [installedOrQueried, setInstalled] = useState(installed)
  const { enqueueSnackbar } = useSnackbar()
  const classes = useStyles()
  useEffect(() => {
    const queuePackage = queue.find((pkg: Package) => name === pkg.name && version === pkg.version)
    if (queuePackage) setInstalled(queuePackage.flag)
  }, [])
  return (
    <Card className={classes.root}>
      <CardActionArea
        onClick={() =>
          push({
            pathname: '/package',
            state: {
              data: { name, version, description, installed, imageUrl, ...rest }
            }
          })
        }
      >
        <CardContent>
          <Paper className={classes.header} elevation={10}>
            <div className={classes.nameHolder}>
              <Img
                className={classes.media}
                src={imageUrl}
                unloader={
                  <img className={classes.media} src={dummyPackageImg} alt={'No Package Found'} />
                }
              />
              <Typography className={classes.name} variant="h5">
                {name}
              </Typography>
            </div>
            <div className={classes.cve}>
              <Chip label={'This month CVEs:'} />
              <Chip
                className={classnames(classes.cveCritical, classes.chipText)}
                label={`Critical: ${cveInfo.critical}`}
              />
              <Chip
                className={classnames(classes.cveImportant, classes.chipText)}
                label={`Important: ${cveInfo.important}`}
              />
              <Chip label={`Low: ${cveInfo.low}`} />
            </div>
          </Paper>
          <Typography
            className={classes.description}
            variant="body1"
            color="textSecondary"
            component="p"
            noWrap
          >
            {description.slice(0, maxDescriptionLength) + '...'}
          </Typography>
        </CardContent>
      </CardActionArea>
      <CardActions className={classes.buttons}>
        {installedOrQueried ? (
          <Button
            onClick={() => {
              enqueueSnackbar(
                queue.find((el: Package) => el.name === name && el.version === version)
                  ? `Package ${name}@${version} dequeued`
                  : `Package ${name}@${version} queued for deletion`,
                {
                  variant: 'error'
                }
              )
              uninstall({ name, version })
              setInstalled(false)
            }}
            variant="outlined"
            size="medium"
            color="secondary"
          >
            Uninstall
          </Button>
        ) : (
          <Button
            onClick={() => {
              enqueueSnackbar(
                queue.find((el: Package) => el.name === name && el.version === version)
                  ? `Package ${name}@${version} dequeued`
                  : `Package ${name}@${version} queued for installation`,
                {
                  variant: 'success'
                }
              )
              install({ name, version })
              setInstalled(true)
            }}
            variant="outlined"
            size="medium"
            color="primary"
          >
            Install
          </Button>
        )}
      </CardActions>
    </Card>
  )
}

const mapStateToProps = ({ queue }: RootState) => ({ queue })

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) =>
  bindActionCreators(
    {
      push,
      install: QueueActions.install,
      uninstall: QueueActions.uninstall
    },
    dispatch
  )

export default connect(mapStateToProps, mapDispatchToProps)(PackagePreview)
