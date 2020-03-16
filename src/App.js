import React from 'react';
import { HashRouter as Router } from 'react-router-dom';
import AV from 'leancloud-storage';

import 'react-virtualized/styles.css';

import Routes from './Routes';

AV.init({
  appId: 'mdia1eUdHV2dArmqzsY0VQ3b-gzGzoHsz',
  appKey: 'RB6pTj7BTomYxy7Bkw0zPqF7',
  serverURLs: 'https://api.xuyanqi.com'
});

const App = () => {
  return (
    <Router>
      <Routes />
    </Router>
  );
};

export default App;
