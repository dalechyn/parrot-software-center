import React, { useCallback, useMemo, useState } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import {
  Button,
  Container,
  Chip,
  IconButton,
  LinearProgress,
  Paper,
  Typography,
  makeStyles,
  Grid,
  PropTypes
} from '@material-ui/core'
import { ArrowUpward, ArrowDownward, Delete } from '@material-ui/icons'
import { AlertActions, QueueActions, AptActions } from '../../actions'
import { INSTALL, QueueNode, UNINSTALL } from '../../store/reducers/queue'

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(2)
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
  }
}))

const flagMap: Record<string, { label: string; color: PropTypes.Color }> = {
  [INSTALL]: {
    label: 'Install',
    color: 'primary'
  },
  [UNINSTALL]: {
    label: 'Uninstall',
    color: 'secondary'
  }
}

type PackageChipProps = {
  flag: string
  classes: {
    chip: string
  }
}

const PackageChip = ({ flag, classes }: PackageChipProps) => {
  return <Chip className={classes.chip} size="medium" variant="outlined" {...flagMap[flag]} />
}

const mapStateToProps = ({ queue }: RootState) => ({ queue })

const mapDispatchToProps = {
  swap: QueueActions.swap,
  remove: QueueActions.remove,
  setAlert: AlertActions.set,
  aptInstall: AptActions.install,
  aptUninstall: AptActions.uninstall
}

const connector = connect(mapStateToProps, mapDispatchToProps)

type QueueProps = ConnectedProps<typeof connector>

const Queue = ({ queue, swap, remove, setAlert, aptInstall, aptUninstall }: QueueProps) => {
  const [progress, setProgress] = useState(0)
  const classes = useStyles()

  const binding: Record<string, Function> = useMemo(
    () => ({
      [INSTALL]: aptInstall,
      [UNINSTALL]: aptUninstall
    }),
    []
  )

  const processPackages = useCallback(async () => {
    try {
      for (let i = 0; i < queue.length; i++) {
        await binding[queue[i].flag](`${queue[i].name}=${queue[i].version}`)
        setProgress(i)
      }
    } catch (e) {
      setAlert(`apt: ${e}`)
    }
  }, [queue, setAlert])

  return (
    <Grid
      container
      direction="column"
      justify="space-evenly"
      alignItems="center"
      alignContent="stretch"
      spacing={2}
      className={classes.root}
    >
      {queue.map((el: QueueNode, i: number) => (
        <Grid item container xs={9} key={el.name + el.version}>
          <Container component={Paper} className={classes.package} key={el.name + el.version}>
            <PackageChip flag={el.flag} classes={classes} />
            <Typography variant="body1">
              {el.name}@{el.version}
            </Typography>
            <div className={classes.buttons}>
              <IconButton
                disabled={i === 0}
                color="secondary"
                aria-label="move to up"
                onClick={() => swap({ first: i, second: i - 1 })}
              >
                <ArrowUpward />
              </IconButton>
              <IconButton
                disabled={i === queue.length - 1}
                color="secondary"
                aria-label="move to down"
                onClick={() => swap({ first: i, second: i + 1 })}
              >
                <ArrowDownward />
              </IconButton>
              <IconButton color="secondary" aria-label="move to down" onClick={() => remove(i)}>
                <Delete />
              </IconButton>
            </div>
          </Container>
        </Grid>
      ))}
      {queue.length !== 0 ? (
        <Button size="large" color="primary" variant="contained" onClick={processPackages}>
          Process
        </Button>
      ) : (
        <Typography variant="h5">Queue is empty</Typography>
      )}
      {progress > 0 && (
        <LinearProgress
          variant="buffer"
          value={((progress - 1) / queue.length) * 100}
          valueBuffer={(progress / queue.length) * 100}
        />
      )}
    </Grid>
  )
}

export default connector(Queue)
