import React from 'react';
import { Switch } from 'react-router-dom';

import { RouteWithLayout } from './components';
import { Blog } from './layouts';

import { HomeView, PostView } from './views';

const Routes = () => {
  return (
    <Switch>
      <RouteWithLayout
        auth={false}
        component={HomeView}
        exact
        layout={Blog}
        path="/"
      />
      <RouteWithLayout
        auth={false}
        component={PostView}
        exact
        layout={Blog}
        path="/post"
      />
    </Switch>
  );
};

export default Routes;
