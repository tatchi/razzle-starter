import App from './App';
import React from 'react';
import { Capture } from 'react-loadable';
import { getBundles } from 'react-loadable/webpack';
import { StaticRouter } from 'react-router-dom';
import express from 'express';
import { renderToString } from 'react-dom/server';
import webpackStats from '../build/stats.json';
import { clearChunks, flushChunkNames } from 'react-universal-component/server';
import flushChunks from 'webpack-flush-chunks';

const assets = require(process.env.RAZZLE_ASSETS_MANIFEST);

const server = express();
server
  .disable('x-powered-by')
  .use(express.static(process.env.RAZZLE_PUBLIC_DIR))
  .get('/*', (req, res) => {
    const context = {};

    clearChunks();

    const markup = renderToString(
      <StaticRouter context={context} location={req.url}>
        <App />
      </StaticRouter>,
    );

    const { js, styles, cssHash, Js, scripts } = flushChunks(webpackStats, {
      chunkNames: flushChunkNames(),
    });

    if (context.url) {
      res.redirect(context.url);
    } else {
      res.status(200).send(
        `<!doctype html>
<html lang="">
  <head>
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta charSet='utf-8' />
    <title>Welcome to Razzle</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    ${assets.client.css ? `<link rel="stylesheet" href="${assets.client.css}">` : ''}
    ${styles}
  </head>
  <body>
    <div id="root">${markup}</div>
          ${cssHash}
          ${js}
          ${
            process.env.NODE_ENV === 'production'
              ? `<script src="${assets.client.js}"></script>`
              : `<script src="${assets.client.js}" crossorigin></script>`
          }
  </body>
</html>`,
      );
    }
  });

export default server;
