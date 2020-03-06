import React from 'react';
import { Route } from 'react-router-dom';
import PropTypes from 'prop-types';
import AV from 'leancloud-storage';

const RouteWithLayout = props => {
  const {
    layout: Layout,
    component: Component,
    auth,
    children,
    ...rest
  } = props;

  return (
    <Route
      {...rest}
      render={matchProps => (
        <Layout {...rest}>
          <Component {...matchProps} />
        </Layout>
      )}
    />
  );
};

RouteWithLayout.propTypes = {
  component: PropTypes.any.isRequired,
  layout: PropTypes.any.isRequired,
  path: PropTypes.string,
  auth: PropTypes.bool
};

export default RouteWithLayout;
