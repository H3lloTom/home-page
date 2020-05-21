import React from 'react';
import ReactDOM from 'react-dom';
import AV from 'leancloud-storage';
import 'react-virtualized/styles.css';
import './index.scss';
import App from './App';

AV.init({
  appId: 'mdia1eUdHV2dArmqzsY0VQ3b-gzGzoHsz',
  appKey: 'RB6pTj7BTomYxy7Bkw0zPqF7',
  serverURLs: 'https://api.xuyanqi.com'
});

ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.unregister();
