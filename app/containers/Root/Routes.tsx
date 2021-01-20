import React from 'react'
import { Switch, Route } from 'react-router-dom'
import { Home, AptPackageInfo, SearchResults, Queue, Mirrors, SnapPackageInfo } from '../index'
import Reports from '../Reports'

const Routes = () => {
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

export default Routes
