import React from 'react'
import { makeStyles } from '@material-ui/core'
import './leaflet.css'

const useStyles = makeStyles({
  root: {
    position: 'absolute',
    left: 0,
    // hack, should be changed if appbar height is changed
    height: 'calc(100% - 65px)',
    width: '100%'
  }
})

const Mirrors = () => {
  const classes = useStyles()
  return (
    <section className={classes.root}>
      <iframe
        id="frame"
        src="https://deb.parrotsec.org/parrot/.mirrorstats"
        width="100%"
        height="100%"
        frameBorder="0"
      />
    </section>
  )
}

export default Mirrors
