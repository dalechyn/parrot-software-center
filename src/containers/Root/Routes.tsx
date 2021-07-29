import React, { useEffect } from 'react'
import { Switch, Route } from 'react-router-dom'
import { ipcRenderer } from 'electron'
import { push } from 'connected-react-router'
import { connect, ConnectedProps } from 'react-redux'
import Reports from '../Reports'
import { Home, AptPackageInfo, SearchResults, Queue, Mirrors, SnapPackageInfo } from '../index'

const mapDispatchToProps = {
  push
}

const connector = connect(null, mapDispatchToProps)

type RoutesProps = ConnectedProps<typeof connector>

const Routes = ({ push }: RoutesProps) => {
  useEffect(() => {
    ipcRenderer.on('ROUTING', (_event, route) => push(route))
  }, [push])

  return (
    <Switch>
      <Route exact path="/">
        <Home />
      </Route>
      <Route exact path="/about">
        About
      </Route>
      <Route exact path="/search/:name/:page?">
        <SearchResults />
      </Route>
      <Route exact path="/package/apt/:name">
        <AptPackageInfo />
      </Route>
      <Route exact path="/package/snap/:name">
        <SnapPackageInfo />
      </Route>
      <Route exact path="/queue">
        <Queue />
      </Route>
      <Route exact path="/mirrors">
        <Mirrors />
      </Route>
      <Route exact path="/reports">
        <Reports />
      </Route>
    </Switch>
  )
}

export default connector(Routes)
