import React from 'react';
import { hydrate } from 'react-dom';
import Loadable from 'react-loadable';
import App from './App';

const root = document.getElementById('root');

window.main = () => {
  render(App);
};

if (module.hot) {
  module.hot.accept('./App', () => {
    const NewApp = require('./App').default;
    render(NewApp);
  });
}

function render(Root) {
  Loadable.preloadReady().then(() => {
    hydrate(<Root />, root);
  });
}
