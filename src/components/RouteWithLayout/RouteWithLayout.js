import React, { useEffect } from 'react';
import { Route, useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';
import AV from 'leancloud-storage';

const RouteWithLayout = props => {
  const hostory = useHistory();
  const {
    layout: Layout,
    component: Component,
    auth,
    children,
    ...rest
  } = props;

  const canVisible = !(auth && !AV.User.current());

  useEffect(() => {
    if (auth === true) {
      const current = AV.User.current();
      if (!current) {
        hostory.replace('/');
      }
    }
  }, [Component]);

  return (
    <Route
      {...rest}
      render={matchProps =>
        canVisible && (
          <Layout {...rest}>
            <Component {...matchProps} />
          </Layout>
        )
      }
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
