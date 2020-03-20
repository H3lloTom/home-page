import React from 'react';
import { hot } from 'react-hot-loader/root';
import { HashRouter as Router } from 'react-router-dom';

import Routes from './Routes';

const App = () => {
  return (
    <Router>
      <Routes />
    </Router>
  );
};

export default process.env.NODE_ENV === 'development' ? hot(App) : App;
