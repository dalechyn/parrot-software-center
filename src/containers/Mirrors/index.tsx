import React, { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { Button, CircularProgress, LinearProgress, makeStyles, Typography } from '@material-ui/core'
import { Circle, MapContainer, Popup, TileLayer, useMapEvents } from 'react-leaflet'
import cls from 'classnames'
import geoip from 'geoip-lite'
import { lookup } from 'dns'

// https://github.com/PaulLeCam/react-leaflet/issues/255

import L, { LatLng } from 'leaflet'

// stupid hack so that leaflet's images work after going through webpack
import marker from 'leaflet/dist/images/marker-icon.png'
import marker2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import { connect, ConnectedProps } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { promisify } from 'util'
import { unwrapResult } from '@reduxjs/toolkit'
import { AptActions } from '../../actions'

// Uhmmm, nice typings man!
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line no-underscore-dangle
delete L.Icon.Default.prototype._getIconUrl

L.Icon.Default.mergeOptions({
  iconRetinaUrl: marker2x,
  iconUrl: marker,
  shadowUrl: markerShadow
})

const promiseLookup = promisify(lookup)

const mirrorsURLs = [
  { url: 'https://mirrors.mit.edu/parrot', commentary: 'SIPB MIT (1Gbps)', id: 'ncsa.mit' },
  {
    url: 'https://mirror.clarkson.edu/parrot',
    commentary: 'Clarkson University',
    id: 'ncsa.clarkson'
  },
  {
    url: 'https://ftp.osuosl.org/pub/parrotos',
    commentary: 'Oregon State University - Open Source Lab',
    id: 'ncsa.osuosl'
  },
  {
    url: 'https://mirrors.ocf.berkeley.edu/parrot',
    commentary: 'Berkeley Open Computing Facility',
    id: 'ncsa.berkeley'
  },
  { url: 'https://muug.ca/mirror/parrot', commentary: 'Manitoba Unix User Group', id: 'ncsa.muug' },
  {
    url: 'https://mirror.cedia.org.ec/parrot',
    commentary: 'RED CEDIA (National research and education center of Ecuador)',
    id: 'ncsa.cedia'
  },
  {
    url: 'https://mirror.uta.edu.ec/parrot',
    commentary: 'UTA (Universidad Técnica de ambato)',
    id: 'ncsa.uta'
  },
  {
    url: 'http://mirror.ueb.edu.ec/parrot',
    commentary: 'UEB (Universidad Estatal de Bolivar)',
    id: 'ncsa.ueb'
  },
  { url: 'http://sft.if.usp.br/parrot', commentary: 'University of Sao Paulo', id: 'ncsa.usp' },
  {
    url: 'https://parrot.mirror.garr.it/parrot',
    commentary: 'GARR Consortium (Italian Research & Education Network)',
    id: 'emea.garr'
  },
  {
    url: 'https://ftp.halifax.rwth-aachen.de/parrotsec',
    commentary: 'RWTH-Aachen (Halifax students group)',
    id: 'emea.halifax'
  },
  {
    url: 'https://ftp-stud.hs-esslingen.de/Mirrors/archive.parrotsec.org',
    commentary: 'Esslingen (University of Applied Sciences)',
    id: 'emea.esslingen'
  },
  { url: 'https://ftp.nluug.nl/os/Linux/distr/parrot', commentary: 'Nluug', id: 'emea.nluug' },
  {
    url: 'https://ftp.acc.umu.se/mirror/parrotsec.org/parrot',
    commentary: 'ACC UMU (Academic Computer Club, Umea University)',
    id: 'emea.umu'
  },
  {
    url: 'https://ftp.cc.uoc.gr/mirrors/linux/parrot',
    commentary: 'UoC (University of Crete - Computer Center)',
    id: 'emea.uoc'
  },
  {
    url: 'https://ftp.belnet.be/pub/archive.parrotsec.org/',
    commentary: 'Belnet (The Belgian National Research)',
    id: 'emea.belnet'
  },
  {
    url: 'https://matojo.unizar.es/parrot',
    commentary: 'Osluz (Oficina de software libre de la Universidad de Zaragoza)',
    id: 'emea.osluz'
  },
  {
    url: 'https://mirrors.up.pt/parrot',
    commentary: 'U.Porto (University of Porto)',
    id: 'emea.up'
  },
  {
    url: 'https://mirrors.dotsrc.org/parrot',
    commentary: 'Dotsrc (Aalborg university)',
    id: 'emea.dotsrc'
  },
  { url: 'https://parrot.mirror.cythin.com/parrot', commentary: 'cythin.com', id: 'emea.cythin' },
  {
    url: 'https://quantum-mirror.hu/mirrors/pub/parrot',
    commentary: 'quantum-mirror.hu',
    id: 'emea.quantum'
  },
  {
    url: 'https://mirror.yandex.ru/mirrors/parrot',
    commentary: 'Yandex Mirror',
    id: 'apac.yandex'
  },
  { url: 'http://mirror.truenetwork.ru/parrot', commentary: 'Truenetwork', id: 'apac.truenetwork' },
  {
    url: 'http://mirrors.comsys.kpi.ua/parrot',
    commentary: 'KPI (National Technical University of Ukraine - Comsys)',
    id: 'emea.comsys'
  },
  {
    url: 'http://mirror.amberit.com.bd/parrotsec',
    commentary: 'Amberit (Dhakacom)',
    id: 'apac.amberit'
  },
  {
    url: 'https://free.nchc.org.tw/parrot',
    commentary: 'NCHC (Free Software Lab)',
    id: 'apac.nchc'
  },
  { url: 'https://mirror.0x.sg/parrot', commentary: '0x', id: 'apac.0x' },
  {
    url: 'https://mirrors.ustc.edu.cn/parrot',
    commentary: 'University of Science and Technology of China and USTCLUG',
    id: 'apac.ustc'
  },
  {
    url: 'https://mirror.kku.ac.th/parrot',
    commentary: 'KKU (Khon Kaen University)',
    id: 'apac.kku'
  },
  {
    url: 'http://kartolo.sby.datautama.net.id/parrot',
    commentary: 'Datautama (PT. Data Utama Dinamika)',
    id: 'apac.datautama'
  },
  {
    url: 'https://mirrors.takeshi.nz/parrot',
    commentary: 'Takeshi (D T Consulting Ltd)',
    id: 'apac.takeshi'
  },
  {
    url: 'http://mirrors.shu.edu.cn/parrot',
    commentary: 'SHU(Shanghai University)',
    id: 'apac.shu'
  },
  {
    url: 'http://mirrors.sjtug.sjtu.edu.cn/parrot',
    commentary: 'SJTUG (SJTU *NIX User Group)',
    id: 'apac.sjtug'
  },
  { url: 'http://mirror.lagoon.nc/pub/parrot', commentary: 'Lagoon', id: 'apac.lagoon' },
  {
    url: 'https://mirrors.tuna.tsinghua.edu.cn/parrot',
    commentary: 'TUNA (Tsinghua university of Beijing, TUNA association)',
    id: 'apac.tuna'
  }
]

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
    alignItems: 'center',
    fontFamily: 'Hack, sans-serif'
  },
  reset: {
    position: 'absolute',
    display: 'flex',
    zIndex: 1000,
    top: 10,
    right: 10,
    alignItems: 'center'
  }
})

type MirrorInfo = {
  lat: number
  lon: number
  id: string
  url: string
  commentary: string
  area: number
}

type ViewPort = {
  center: L.LatLng
  zoom: number
}

type MapChildrenProps = {
  mirrors: MirrorInfo[]
  darkTheme: boolean
  setViewPort: Dispatch<SetStateAction<ViewPort>>
  currentMirror: string
  changeMirror: MirrorProps['changeMirror']
  refreshCurrentMirror: () => Promise<void>
}

const MapChildren = ({
  mirrors,
  darkTheme,
  setViewPort,
  changeMirror,
  currentMirror,
  refreshCurrentMirror,
  ...props
}: MapChildrenProps) => {
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

      {mirrors.map(({ lat, lon, id, commentary, area, url }, i) => (
        <Circle
          key={`circle-${i}`}
          center={[lat, lon]}
          radius={area}
          pathOptions={currentMirror === id ? { color: 'green' } : undefined}
        >
          <Popup>
            <div className={classes.popup}>
              <div>
                <b>ID:</b> {id}
                <br />
                <b>Description:</b> {commentary}
              </div>
              {currentMirror !== id && (
                <div>
                  <Button
                    onClick={async () => {
                      unwrapResult(await changeMirror(url))
                      await refreshCurrentMirror()
                    }}
                    color="secondary"
                    variant="outlined"
                  >
                    Switch
                  </Button>
                </div>
              )}
            </div>
          </Popup>
        </Circle>
      ))}
    </>
  )
}

const corner1 = L.latLng(-90, -200)
const corner2 = L.latLng(90, 200)
const bounds = L.latLngBounds(corner1, corner2)

const mapStateToProps = ({ settings: { darkTheme } }: RootState) => ({ darkTheme })

const mapDispatchToProps = {
  resetMirror: AptActions.resetMirror,
  changeMirror: AptActions.changeMirror,
  readMirror: AptActions.readMirror
}

const connector = connect(mapStateToProps, mapDispatchToProps)

type MirrorProps = ConnectedProps<typeof connector>

const Mirrors = ({ darkTheme, resetMirror, changeMirror, readMirror }: MirrorProps) => {
  const classes = useStyles()
  const [loading, setLoading] = useState(true)
  const [loadingText, setLoadingText] = useState('')
  const [mirrors, setMirrors] = useState(Array<MirrorInfo>())
  const [currentMirrorInfo, setCurrentMirrorInfo] = useState({ id: '', text: '', detected: false })
  const [viewPort, setViewPort] = useState({ center: new LatLng(50, 30), zoom: 3 })

  const { t } = useTranslation()

  const refreshCurrentMirror = async () => {
    setLoading(true)
    try {
      const readUrl = unwrapResult(await readMirror())
      const mirrorId = mirrorsURLs.find(({ url }) => url === readUrl)?.id
      setCurrentMirrorInfo(
        mirrorId
          ? { id: mirrorId, text: `${t('mirrorsConnectedTo')} ${mirrorId}`, detected: true }
          : { id: '', text: t('mirrorsCantBeDetected'), detected: false }
      )
      if (readUrl?.startsWith('https://deb.parrotsec.org/'))
        setCurrentMirrorInfo({ id: '', text: t('mirrorsConnectedToCDN'), detected: true })
    } catch {
      setCurrentMirrorInfo({ id: '', text: t('mirrorsCantBeDetected'), detected: false })
    }
    setLoading(false)
  }

  useEffect(() => {
    let active = true
    ;(async () => {
      let i = 0
      const resolveMirrorsInfoPromises = mirrorsURLs.map(mirror =>
        (async () => {
          const resolvedIP = await promiseLookup(mirror.url.split('/')[2], { all: false })
          if (!active) {
            console.debug('Request canceled')
            throw new Error('Request canceled')
          }
          const geoInfo = geoip.lookup(resolvedIP.address)
          setLoadingText(`${t('mirrorsScanningMirrors')} (${i++}/${mirrorsURLs.length})...`)
          if (geoInfo) {
            return {
              ...mirror,
              lat: geoInfo.ll[0],
              lon: geoInfo.ll[1],
              area: geoInfo.area
            }
          }
          console.debug(`DNS resolution failed: ${mirror.url}`)
          throw new Error(`DNS resolution failed: ${mirror.url}`)
        })()
      )

      const data = await Promise.allSettled(resolveMirrorsInfoPromises)
      if (!active) return
      setMirrors(
        data.reduce(
          (acc, el) => (el.status === 'fulfilled' ? [...acc, el.value] : acc),
          Array<MirrorInfo>()
        )
      )

      setLoadingText(t('mirrorsScanningPolicy'))
      await refreshCurrentMirror()
    })()
    return () => {
      active = false
    }
  }, [])

  return (
    <section className={classes.root}>
      {darkTheme && (
        <style>
          {`.leaflet-control-zoom-in { background-color: #272727 !important; color: white !important;
        border-bottom-color: #424242 !important; }
        .leaflet-control-zoom-out { background-color: #272727 !important; color: white !important; }
        .leaflet-popup-content-wrapper { border-radius: 5px !important; background-color: #272727 !important; color: white !important; }
        .leaflet-popup-tip { background-color: #272727 !important; }`}
        </style>
      )}
      <div className={classes.reset}>
        <div style={{ marginRight: 10 }}>
          <Typography>{currentMirrorInfo.text}</Typography>
          {currentMirrorInfo.detected && <LinearProgress />}
        </div>
        {!loading && (
          <Button
            variant="outlined"
            onClick={async () => {
              unwrapResult(await resetMirror())
              await refreshCurrentMirror()
            }}
          >
            {t('resetDefault')}
          </Button>
        )}
      </div>
      {loading ? (
        <>
          <div className={classes.loadingTextHolder}>
            <CircularProgress />
            <Typography variant="h5" className={classes.loadingText}>
              {loadingText}
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
          <MapChildren
            mirrors={mirrors}
            darkTheme
            currentMirror={currentMirrorInfo.id}
            setViewPort={setViewPort}
            changeMirror={changeMirror}
            refreshCurrentMirror={refreshCurrentMirror}
          />
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
          <MapChildren
            mirrors={mirrors}
            currentMirror={currentMirrorInfo.id}
            darkTheme={false}
            setViewPort={setViewPort}
            changeMirror={changeMirror}
            refreshCurrentMirror={refreshCurrentMirror}
          />
        </MapContainer>
      )}
    </section>
  )
}

export default connector(Mirrors)
