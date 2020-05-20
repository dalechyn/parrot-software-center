import React, { useCallback, useState } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import {
  Button,
  Container,
  Chip,
  IconButton,
  LinearProgress,
  Paper,
  Typography,
  makeStyles,
  Grid
} from '@material-ui/core'
import { ArrowUpward, ArrowDownward, Delete } from '@material-ui/icons'
import { QueueConstants } from '../../constants'
import { alertActions, queueActions } from '../../actions'
import { bindActionCreators } from 'redux'

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

const flagMap = {
  [QueueConstants.INSTALL]: {
    label: 'Install',
    color: 'primary'
  },
  [QueueConstants.UNINSTALL]: {
    label: 'Uninstall',
    color: 'secondary'
  }
}

const makeChip = (flag, classes) => {
  return <Chip className={classes.chip} size="medium" variant="outlined" {...flagMap[flag]} />
}

const binding = {
  [QueueConstants.UNINSTALL]: window.aptRemove,
  [QueueConstants.INSTALL]: window.aptInstall
}

const Queue = ({ queue, swap, clear, setAlert }) => {
  const [progress, setProgress] = useState(0)
  const classes = useStyles()

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
      xs={12}
    >
      {queue.map((el, i) => (
        <Grid item container xs={9} key={el.name + el.version}>
          <Container component={Paper} className={classes.package} key={el.name + el.version}>
            {makeChip(el.flag, classes)}
            <Typography variant="body1">
              {el.name}@{el.version}
            </Typography>
            <div className={classes.buttons}>
              <IconButton
                disabled={i === 0}
                color="secondary"
                aria-label="move to up"
                onClick={() => swap(i, i - 1)}
              >
                <ArrowUpward />
              </IconButton>
              <IconButton
                disabled={i === queue.length - 1}
                color="secondary"
                aria-label="move to down"
                onClick={() => swap(i, i + 1)}
              >
                <ArrowDownward />
              </IconButton>
              <IconButton color="secondary" aria-label="move to down" onClick={() => clear(i)}>
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

if (process.env.node_env === 'development') {
  Queue.propTypes = {
    queue: PropTypes.array,
    swap: PropTypes.func,
    clear: PropTypes.func,
    setAlert: PropTypes.func
  }
}

const mapStateToProps = ({ queue }) => ({ queue })

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      swap: queueActions.swap,
      clear: queueActions.delete,
      setAlert: alertActions.set
    },
    dispatch
  )

export default connect(mapStateToProps, mapDispatchToProps)(Queue)
