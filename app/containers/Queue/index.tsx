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
import { INSTALL, UNINSTALL } from '../../reducers/queue'

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(2),
    width: '100%'
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
    width: '100vw'
  }
}))

export interface QueueNode {
  name: string
  flag: string
}

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

const mapStateToProps = ({ queue: { packages, globalProgress } }: RootState) => ({
  packages,
  globalProgress
})

const mapDispatchToProps = {
  swap: QueueActions.swap,
  remove: QueueActions.remove,
  setAlert: AlertActions.set,
  aptProcess: AptActions.process
}

const connector = connect(mapStateToProps, mapDispatchToProps)

type QueueProps = ConnectedProps<typeof connector>

const Queue = ({ packages, globalProgress, swap, remove, setAlert, aptProcess }: QueueProps) => {
  const classes = useStyles()
  const [processing, setProcessing] = useState(false)
  const length = useMemo(() => packages.length, [])

  const processPackages = useCallback(async () => {
    setProcessing(true)
    const res = await aptProcess(packages)
    if (AptActions.process.rejected.match(res)) setAlert(`apt: ${res}`)
  }, [packages, setAlert])

  return (
    <>
      <Grid
        container
        direction="column"
        justify="space-evenly"
        alignItems="center"
        alignContent="stretch"
        spacing={2}
        className={classes.root}
      >
        {packages.map((el: QueueNode, i: number) => (
          <Grid item container xs={8} key={el.name}>
            <Container
              maxWidth="xl"
              component={Paper}
              square
              className={classes.package}
              key={el.name}
            >
              <PackageChip flag={el.flag} classes={classes} />
              <Typography variant="body1">{el.name}</Typography>
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
            </Container>
            {i === 0 && processing && <LinearProgress className={classes.progress} />}
          </Grid>
        ))}

        <Grid container justify="center">
          {packages.length !== 0 ? (
            <Button
              size="large"
              color="primary"
              variant="contained"
              disabled={globalProgress !== 0}
              onClick={processPackages}
            >
              Process
            </Button>
          ) : (
            <Typography variant="h5">Queue is empty</Typography>
          )}
        </Grid>

        {globalProgress > 0 && (
          <Grid item container xs={9}>
            <LinearProgress
              className={classes.progress}
              variant="buffer"
              value={((globalProgress - 1) / length) * 100}
              valueBuffer={(globalProgress / length) * 100}
            />
          </Grid>
        )}
      </Grid>
    </>
  )
}

export default connector(Queue)
