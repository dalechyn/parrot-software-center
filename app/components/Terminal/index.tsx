import React, { useEffect, ReactNode, useState } from 'react'
import { AlertActions } from '../../actions'
import { Button, Grid, makeStyles, Typography } from '@material-ui/core'
import { connect, ConnectedProps } from 'react-redux'
import { grey } from '@material-ui/core/colors'
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(2)
  },
  list: {
    overflow: 'auto',
    maxHeight: 500
  },
  top: {
    background: grey[800]
  },
  button: {
    marginTop: theme.spacing(2)
  }
}))

const mapDispatchToProps = { setAlert: AlertActions.set }
const connector = connect(null, mapDispatchToProps)

type TerminalProps = ConnectedProps<typeof connector> & {
  width?: string | number
  height: string | number
  initialLine?: string
  serveStream: (onValue: (chunk: string) => void, onFinish: () => void) => Promise<void>
  onClose: () => void
}

const Terminal = ({ serveStream, setAlert, initialLine, onClose }: TerminalProps) => {
  const [list, setList] = useState(Array<ReactNode>(initialLine))
  const [finished, setFinished] = useState(false)
  const classes = useStyles()
  const { t } = useTranslation();
  useEffect(() => {
    const f = async () => {
      try {
        const lines = list.slice()
        await serveStream(
          (chunk: string) => {
            lines.push(
              <>
                <Typography style={{ whiteSpace: 'pre-wrap' }} key={lines.length}>
                  {chunk}
                </Typography>
                <br key={lines.length + 'br'} />
              </>
            )
            setList(lines)
          },
          () => setFinished(true)
        )
      } catch (e) {
        setAlert(e)
      }
    }
    f()
  }, [])
  return (
    <Grid container justify="center" className={classes.root}>
      <Grid className={classes.list} item xs={12}>
        {list}
      </Grid>
      {finished && (
        <Grid className={classes.button} item xs={1}>
          <Button variant="contained" onClick={onClose}>
            {t('close')}
          </Button>
        </Grid>
      )}
    </Grid>
  )
}

export default connector(Terminal)

