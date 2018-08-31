import App from './App';
import React from 'react';
import { Capture } from 'react-loadable';
import { getBundles } from 'react-loadable/webpack';
import { StaticRouter } from 'react-router-dom';
import express from 'express';
import { renderToString } from 'react-dom/server';
import stats from '../build/react-loadable.json';

const assets = require(process.env.RAZZLE_ASSETS_MANIFEST);

const server = express();
server
  .disable('x-powered-by')
  .use(express.static(process.env.RAZZLE_PUBLIC_DIR))
  .get('/*', (req, res) => {
    const context = {};
    const modules = [];
    const markup = renderToString(
      <StaticRouter context={context} location={req.url}>
        <App />
      </StaticRouter>,
    );

    if (context.url) {
      res.redirect(context.url);
    } else {
      const bundles = getBundles(stats, modules);
      // console.log(modules);
      const chunks = bundles.filter(bundle => bundle.file.endsWith('.js'));
      const styles = bundles.filter(bundle => bundle.file.endsWith('.css'));
      // console.log(styles);
      res.status(200).send(
        `<!doctype html>
<html lang="">
  <head>
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta charSet='utf-8' />
    <title>Welcome to Razzle</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    ${assets.client.css ? `<link rel="stylesheet" href="${assets.client.css}">` : ''}
  </head>
  <body>
    <div id="root">${markup}</div>
          ${
            process.env.NODE_ENV === 'production'
              ? `<script src="${assets.client.js}"></script>`
              : `<script src="${assets.client.js}" crossorigin></script>`
          }
          <script>window.main();</script>
  </body>
</html>`,
      );
    }
  });

export default server;
