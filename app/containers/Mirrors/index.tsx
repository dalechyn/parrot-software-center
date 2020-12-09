import React, { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { Button, CircularProgress, makeStyles, Typography } from '@material-ui/core'
import JSON5 from 'json5'
import { Error } from '@material-ui/icons'
import { Marker, MapContainer, Popup, TileLayer, useMapEvents } from 'react-leaflet'
import MirrorDown from './assets/mirror_down.png'
import MirrorUp from './assets/mirror_up.png'
import cls from 'classnames'

// https://github.com/PaulLeCam/react-leaflet/issues/255

import L, { divIcon, LatLng } from 'leaflet'

// stupid hack so that leaflet's images work after going through webpack
import marker from 'leaflet/dist/images/marker-icon.png'
import marker2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import { connect, ConnectedProps } from 'react-redux'
import { useTranslation } from 'react-i18next'

// Uhmmm, nice typings man!
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl

L.Icon.Default.mergeOptions({
  iconRetinaUrl: marker2x,
  iconUrl: marker,
  shadowUrl: markerShadow
})

const useStyles = makeStyles({
  root: {
    position: 'absolute',
    left: 0,
    // hack, should be changed if appbar height is changed
    height: 'calc(100% - 65px)',
    width: '100%',
    display: 'flex',
    flexFlow: 'column',
    justifyContent: 'center'
  },
  loadingTextHolder: {
    marginTop: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  loadingText: {
    marginLeft: 5
  },
  map: {
    height: '100%',
    width: '100%'
  },
  mapDarkBackground: {
    background: '#262626'
  },
  popup: {
    display: 'flex',
    flexFlow: 'column',
    alignItems: 'center'
  }
})

type MirrorInfo = {
  lat: number
  lon: number
  id: string
  enabled: boolean
  up: boolean
}

type ViewPort = {
  center: L.LatLng
  zoom: number
}

type MapChildrenProps = {
  mirrors: MirrorInfo[]
  darkTheme: boolean
  setViewPort: Dispatch<SetStateAction<ViewPort>>
}

const MapChildren = ({ mirrors, darkTheme, setViewPort, ...props }: MapChildrenProps) => {
  const classes = useStyles()
  const map = useMapEvents({
    zoom: () => {
      setViewPort({ center: map.getCenter(), zoom: map.getZoom() })
    },
    moveend: () => {
      setViewPort({ zoom: map.getZoom(), center: map.getCenter() })
    }
  })
  return (
    <>
      <TileLayer
        attribution={`&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors ${
          darkTheme ? '&copy; <a href="http://cartodb.com/attributions">CartoDB</a>' : ''
        }`}
        url={
          darkTheme
            ? 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png'
            : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        }
        {...props}
      />

      {mirrors.map(({ lat, lon, id, up }, i) => (
        <Marker
          /*icon={
        <img
          src={up ? MirrorUp : MirrorDown}
          height={43}
          width={32}
          className={classes.marker}
          alt=""
        />
      }*/
          icon={divIcon({
            html: `<img src="${up ? MirrorUp : MirrorDown}"  alt="popup"/>`,
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            tooltipAnchor: [16, -28],
            shadowSize: [41, 41]
          })}
          key={`marker-${i}`}
          position={[lat, lon]}
        >
          <Popup>
            <div className={classes.popup}>
              <div>Mirror ID: {id}</div>
              <div>
                <Button color="secondary" variant="outlined">
                  Disable
                </Button>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  )
}

const corner1 = L.latLng(-90, -200)
const corner2 = L.latLng(90, 200)
const bounds = L.latLngBounds(corner1, corner2)

const mapStateToProps = ({ settings: { darkTheme } }: RootState) => ({ darkTheme })

const connector = connect(mapStateToProps)

type MirrorProps = ConnectedProps<typeof connector>

const Mirrors = ({ darkTheme }: MirrorProps) => {
  const classes = useStyles()
  const [statusCode, setStatusCode] = useState(-1)
  const [mirrors, setMirrors] = useState(Array<MirrorInfo>())
  const [viewPort, setViewPort] = useState({ center: new LatLng(50, 30), zoom: 3 })

  const { t } = useTranslation();

  useEffect(() => {
    // loading .mirrorstats page
    ;(async () => {
      // I hope at some point we will have an endpoint that returns
      // mirrors as JSON, because this is silly.
      const res = await fetch('https://deb.parrotsec.org/parrot/.mirrorstats')
      setStatusCode(res.status)
      if (!res.ok) return
      const parser = new DOMParser()
      const doc = parser.parseFromString(await res.text(), 'text/html')
      const parsedScript = doc.querySelector('#content > script')?.textContent
      const matches = parsedScript?.match(/mirrors = ({(?:.*\n? )+})/)
      if (!matches) {
        setStatusCode(0)
        return
      }
      const parsedJson = JSON5.parse(matches[1])

      setMirrors(parsedJson.rows)
    })()
  }, [])

  return (
    <section className={classes.root}>
      {statusCode === -1 ? (
        <>
          <div className={classes.loadingTextHolder}>
            <CircularProgress />
            <Typography variant={'h5'} className={classes.loadingText}>
              {t('loading')}...
            </Typography>
          </div>
        </>
      ) : statusCode === 0 ? (
        <>
          <div className={classes.loadingTextHolder}>
            <Error />
            <Typography variant={'h5'} className={classes.loadingText}>
              {t('errStatMirror')}
            </Typography>
          </div>
        </>
      ) : statusCode >= 400 && statusCode < 500 ? (
        <>
          <div className={classes.loadingTextHolder}>
            <Error />
            <Typography variant={'h5'} className={classes.loadingText}>
              {t('fetchErr')}
            </Typography>
          </div>
        </>
      ) : statusCode >= 500 ? (
        <>
          <div className={classes.loadingTextHolder}>
            <Error />
            <Typography variant={'h5'} className={classes.loadingText}>
              {t('serverErr')}
            </Typography>
          </div>
        </>
      ) : darkTheme ? (
        // There is no way to use dynamical tilelayer so in order to recreate the whole map and don't
        // break the mapcontainer we need to recreate it from the top
        <MapContainer
          className={cls(classes.map, classes.mapDarkBackground)}
          center={viewPort.center}
          zoom={viewPort.zoom}
          key="map-dark"
          scrollWheelZoom
          maxBoundsViscosity={1.0}
          maxBounds={bounds}
          minZoom={2.0}
        >
          <MapChildren mirrors={mirrors} darkTheme={true} setViewPort={setViewPort} />
        </MapContainer>
      ) : (
        <MapContainer
          className={classes.map}
          center={viewPort.center}
          zoom={viewPort.zoom}
          key="map-light"
          scrollWheelZoom
          maxBoundsViscosity={1.0}
          maxBounds={bounds}
          minZoom={2.0}
        >
          <MapChildren mirrors={mirrors} darkTheme={false} setViewPort={setViewPort} />
        </MapContainer>
      )}
    </section>
  )
}

export default connector(Mirrors)
