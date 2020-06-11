import React from 'react'
import { Map, TileLayer, Marker, Popup } from 'react-leaflet'
import { makeStyles } from '@material-ui/core'
import './leaflet.css'

const useStyles = makeStyles({
  root: {
    position: 'absolute',
    left: 0,
    // hack, should be changed if appbar height is changed
    height: 'calc(100% - 65px)',
    width: '100%'
  },
  map: {
    height: '100%',
    width: '100%'
  }
})

const Mirrors = () => {
  const classes = useStyles()
  return (
    <section className={classes.root}>
      <Map
        className={classes.map}
        center={[50, 10]}
        zoom={6}
        maxZoom={10}
        easeLinearity={0.35}
        attributionControl
        zoomControl
        doubleClickZoom
        scrollWheelZoom
        dragging
        animate
      >
        <TileLayer url="http://{s}.tile.osm.org/{z}/{x}/{y}.png" />
        <Marker position={[50, 10]}>
          <Popup>Mirror</Popup>
        </Marker>
      </Map>
    </section>
  )
}

export default Mirrors
