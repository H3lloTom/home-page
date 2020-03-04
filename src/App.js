import React from 'react';
import { HashRouter as Router } from 'react-router-dom';

import Routes from './Routes';

const App = () => {
  return (
    <Router>
      <Routes />
    </Router>
  );
};

export default App;
