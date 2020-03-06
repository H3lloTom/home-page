import React from 'react';
import { Switch } from 'react-router-dom';

import { RouteWithLayout } from './components';
import { Blog, Admin } from './layouts';

import { Home, Post, Profile, Purchase } from './views';

const Routes = () => {
  return (
    <Switch>
      <RouteWithLayout
        auth={false}
        component={Home}
        exact
        layout={Blog}
        path="/"
      />
      <RouteWithLayout
        auth={false}
        component={Post}
        exact
        layout={Blog}
        path="/post"
      />
      <RouteWithLayout
        auth={false}
        component={Profile}
        exact
        layout={Blog}
        path="/profile"></RouteWithLayout>
      <RouteWithLayout
        auth={false}
        component={Purchase}
        exact
        layout={Admin}
        pageTitle="进销存"
        contentTitle="采购入库"
        path="/purchase"></RouteWithLayout>
    </Switch>
  );
};

export default Routes;
