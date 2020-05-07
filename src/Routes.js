import React from 'react';
import { Switch, Router } from 'react-router-dom';

import { RouteWithLayout } from './components';
import { Blog, Admin } from './layouts';

import { Home, Post, Profile } from './views';
import {
  Purchase,
  GoodsList,
  Stock,
  Sale,
  BlogList,
  Billing,
  BlogEdit,
  DirectoryManager
} from './admin';

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
        auth
        component={Purchase}
        exact
        layout={Admin}
        pageTitle="进销存"
        contentTitle="采购入库"
        path="/a/purchase"></RouteWithLayout>
      <RouteWithLayout
        auth
        component={GoodsList}
        exact
        layout={Admin}
        pageTitle="进销存"
        contentTitle="商品库"
        path="/a/goods"></RouteWithLayout>
      <RouteWithLayout
        auth
        component={Stock}
        exact
        layout={Admin}
        pageTitle="进销存"
        contentTitle="库存总量"
        path="/a/stock"></RouteWithLayout>
      <RouteWithLayout
        auth
        component={Sale}
        exact
        layout={Admin}
        pageTitle="进销存"
        contentTitle="销售统计"
        path="/a/sale"></RouteWithLayout>
      <RouteWithLayout
        auth
        component={DirectoryManager}
        exact
        layout={Admin}
        pageTitle="博客管理"
        path="/a/post"></RouteWithLayout>
      <RouteWithLayout
        auth
        component={BlogEdit}
        exact
        layout={Admin}
        pageTitle="博客管理"
        contentTitle=""
        path="/a/post/edit/:id?"></RouteWithLayout>
      <RouteWithLayout
        auth
        component={Billing}
        exact
        layout={Admin}
        pageTitle="记账单"
        contentTitle=""
        path="/a/billing"></RouteWithLayout>
    </Switch>
  );
};

export default Routes;
