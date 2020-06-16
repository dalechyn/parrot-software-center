import React, { useEffect, useMemo, ReactElement } from 'react'
import { Readable } from 'stream'
import { Paper, makeStyles } from '@material-ui/core'

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(2)
  }
}))

type TerminalProps = {
  width: string | number
  height: string | number
  stdout: Readable
}

const Terminal = ({ stdout }: TerminalProps) => {
  const list = useMemo(() => Array<ReactElement>(), [])
  const classes = useStyles()
  useEffect(() => {
    if (stdout) {
      stdout.on('data', chunk => list.push(<p key={list.length}>{chunk}</p>))
    }
  }, [])
  return <Paper className={classes.root}>{list}</Paper>
}

export default Terminal
