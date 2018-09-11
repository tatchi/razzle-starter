import App from './App';
import React from 'react';
import { hydrate } from 'react-dom';
import Loadable from '@7rulnik/react-loadable';
import BrowserRouter from 'react-router-dom/BrowserRouter';

Loadable.preloadReady().then(() => {
  return hydrate(
    <BrowserRouter>
      <App />
    </BrowserRouter>,
    document.getElementById('root'),
  );
});

if (module.hot) {
  module.hot.accept();
}
