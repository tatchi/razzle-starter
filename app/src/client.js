import App from './App';
import React from 'react';
import { hydrate } from 'react-dom';
import Loadable from 'react-loadable-local';
import BrowserRouter from 'react-router-dom/BrowserRouter';

Loadable.preloadReady().then(() => {
  hydrate(
    <BrowserRouter>
      <App />
    </BrowserRouter>,
    document.getElementById('root'),
  );
});

if (module.hot) {
  module.hot.accept();
}
