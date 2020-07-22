import React from 'react'
import { Switch, Route } from 'react-router-dom'
import { Home, PackageInfo, SearchResults, Queue, Mirrors } from '../index'

const Routes = () => {
  return (
    <Switch>
      <Route exact path="/">
        <Home />
      </Route>
      <Route exact path="/store">
        Store
      </Route>
      <Route exact path="/about">
        About
      </Route>
      <Route exact path="/search/:name/:page?">
        <SearchResults />
      </Route>
      <Route exact path="/package/:name">
        <PackageInfo />
      </Route>
      <Route exact path="/queue">
        <Queue />
      </Route>
      <Route exact path="/mirrors">
        <Mirrors />
      </Route>
    </Switch>
  )
}

export default Routes
