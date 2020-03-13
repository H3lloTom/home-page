import React from 'react';
import { Switch } from 'react-router-dom';

import { RouteWithLayout } from './components';
import { Blog, Admin } from './layouts';

import { Home, Post, Profile, Purchase, Goods, Stock, Outbound } from './views';

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
      <RouteWithLayout
        auth={false}
        component={Goods}
        exact
        layout={Admin}
        pageTitle="进销存"
        contentTitle="商品库"
        path="/goods"></RouteWithLayout>
      <RouteWithLayout
        auth={false}
        component={Stock}
        exact
        layout={Admin}
        pageTitle="进销存"
        contentTitle="库存总量"
        path="/stock"></RouteWithLayout>
      <RouteWithLayout
        auth={false}
        component={Outbound}
        exact
        layout={Admin}
        pageTitle="进销存"
        contentTitle="出库单"
        path="/outbound"></RouteWithLayout>
    </Switch>
  );
};

export default Routes;
