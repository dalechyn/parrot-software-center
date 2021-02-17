import React, { useCallback, useState } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import {
  Button,
  Container,
  List,
  Chip,
  IconButton,
  LinearProgress,
  Paper,
  Typography,
  makeStyles,
  Grid,
  ListItem
} from '@material-ui/core'
import { ArrowUpward, ArrowDownward, Delete } from '@material-ui/icons'
import { AlertActions, QueueActions, AptActions } from '../../actions'
import { INSTALL, UNINSTALL, UPGRADE } from '../../actions/apt'
import classnames from 'classnames'
import { QueueNodeMeta } from '../../actions/queue'
import { grey } from '@material-ui/core/colors'
import { useTranslation } from 'react-i18next'
import { TFunction } from 'i18next'

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(2)
  },
  container: {
    display: 'flex',
    flexFlow: 'column'
  },
  package: {
    display: 'flex',
    padding: theme.spacing(2),
    alignItems: 'center'
  },
  chip: {
    marginRight: theme.spacing(1)
  },
  buttons: {
    marginLeft: 'auto'
  },
  progress: {
    width: '100%'
  },
  source: {
    color: grey[500],
    marginLeft: theme.spacing(2)
  },
  mTop: {
    marginTop: theme.spacing(2)
  }
}))

export type QueueNode = QueueNodeMeta & {
  flag: typeof INSTALL | typeof UNINSTALL | typeof UPGRADE | null
}

const flagMap = (t: TFunction): Record<string, Partial<typeof Chip>> => ({
  [INSTALL]: {
    label: `${t('installChip')} +`,
    color: 'primary'
  },
  [UNINSTALL]: {
    label: `${t('uninstallChip')} -`,
    color: 'secondary'
  },
  [UPGRADE]: {
    label: `${t('upgradeChip')} ↑`,
    color: 'primary'
  }
})

type PackageChipProps = {
  classes: {
    chip: string
  }
} & Partial<Pick<QueueNode, 'flag'>>

const PackageChip = ({ flag, classes }: PackageChipProps) => {
  const { t } = useTranslation()
  return flag ? <Chip className={classes.chip} size="medium" {...flagMap(t)[flag]} /> : null
}

const mapStateToProps = ({ queue: { packages, globalProgress, isBusy, length } }: RootState) => ({
  packages,
  globalProgress,
  isBusy,
  length
})

const mapDispatchToProps = {
  swap: QueueActions.swap,
  remove: QueueActions.remove,
  setAlert: AlertActions.set,
  aptProcess: AptActions.perform
}

const connector = connect(mapStateToProps, mapDispatchToProps)

type QueueProps = ConnectedProps<typeof connector>

const Queue = ({
  packages,
  globalProgress,
  swap,
  remove,
  setAlert,
  aptProcess,
  isBusy,
  length
}: QueueProps) => {
  const classes = useStyles()
  const [processing, setProcessing] = useState(isBusy)

  const processPackages = useCallback(async () => {
    setProcessing(true)
    if (AptActions.perform.rejected.match(await aptProcess(packages))) setProcessing(false)
  }, [packages, setAlert])

  const { t } = useTranslation()

  return (
    <Grid
      container
      direction="column"
      justify="space-evenly"
      alignItems="center"
      alignContent="stretch"
      className={classes.root}
    >
      <Grid container item xs={10}>
        {packages.length !== 0 && (
          <Paper style={{ width: '100%' }}>
            <List style={{ maxHeight: 800, overflow: 'auto' }} className={classes.root}>
              {packages.map((el: QueueNode, i: number) => (
                <ListItem key={el.name}>
                  <Container
                    maxWidth="xl"
                    component={Paper}
                    square
                    disableGutters
                    className={classes.container}
                    key={el.name}
                    elevation={10}
                  >
                    <div className={classes.package}>
                      <PackageChip flag={el.flag} classes={classes} />
                      <Typography variant="body1">{el.name}</Typography>
                      <Typography className={classes.source} variant="body1">
                        {el.source}
                      </Typography>
                      <Typography className={classes.source} variant="body1">
                        {el.source === 'APT' ? el.version : el.version.split(':')[1]}
                      </Typography>
                      <div className={classes.buttons}>
                        <IconButton
                          disabled={i === 0 || processing}
                          color="secondary"
                          aria-label="move to up"
                          onClick={() => swap({ first: i, second: i - 1 })}
                        >
                          <ArrowUpward />
                        </IconButton>
                        <IconButton
                          disabled={i === packages.length - 1 || processing}
                          color="secondary"
                          aria-label="move to down"
                          onClick={() => swap({ first: i, second: i + 1 })}
                        >
                          <ArrowDownward />
                        </IconButton>
                        <IconButton
                          color="secondary"
                          aria-label="delete"
                          disabled={processing}
                          onClick={() => remove(i)}
                        >
                          <Delete />
                        </IconButton>
                      </div>
                    </div>
                    {i === 0 && processing && <LinearProgress className={classes.progress} />}
                  </Container>
                </ListItem>
              ))}
            </List>
          </Paper>
        )}
      </Grid>

      <Grid className={classes.mTop} container item xs={12} justify="center">
        {packages.length !== 0 ? (
          <Button
            size="large"
            color="primary"
            variant="contained"
            disabled={globalProgress !== 0}
            onClick={processPackages}
          >
            {t('process')}
          </Button>
        ) : (
          <Typography variant="h5">{t('queueEmpty')}</Typography>
        )}
      </Grid>

      {globalProgress > 0 && (
        <Grid item container xs={9}>
          <LinearProgress
            className={classnames(classes.progress, classes.mTop)}
            variant="buffer"
            value={((globalProgress - 1) / length) * 100}
            valueBuffer={(globalProgress / length) * 100}
          />
        </Grid>
      )}
    </Grid>
  )
}

export default connector(Queue)
