import App from './App';
import React from 'react';
import { Capture } from 'react-loadable';
import express from 'express';
import { renderToString } from 'react-dom/server';
import { ServerLocation, isRedirect } from '@reach/router';
// import webpackStats from '../build/stats.json';
import { getBundles } from 'react-loadable-ssr-addon';
import stats from '../build/react-loadable.json';
import { join } from 'upath';

const assets = require(process.env.RAZZLE_ASSETS_MANIFEST);

const server = express();
server
  .disable('x-powered-by')
  .use(express.static(process.env.RAZZLE_PUBLIC_DIR))
  .get('/*', (req, res) => {
    let modules = [];
    let markup;

    try {
      markup = renderToString(
        <Capture report={moduleName => modules.push(moduleName)}>
          <ServerLocation url={req.url}>
            <App />
          </ServerLocation>
        </Capture>,
      );
    } catch (error) {
      if (isRedirect(error)) {
        res.redirect(error.uri);
      }
    }

    // console.log({ modules });
    // console.log({ stats });

    const modulesToBeLoaded = [...stats.entrypoints, ...Array.from(modules)];

    let bundles = getBundles(stats, modulesToBeLoaded);
    console.log({ bundles });

    // const clientJs = webpackStats.namedChunkGroups.client.assets.filter(asset => asset.endsWith('.js'));
    // const clientCss = webpackStats.namedChunkGroups.client.assets.filter(asset => asset.endsWith('.css'));

    // console.log({ clientJs });

    // const getNameFromModule = module => module.split('/')[1];

    // const moduleNames = modules.map(getNameFromModule);

    const jsChunks = bundles.js || [];
    const cssChunks = bundles.css || [];

    // let cssChunks = bundles.filter(bundle => bundle.file.endsWith('.css'));
    // let jsChunks = bundles.filter(bundle => bundle.file.endsWith('.js'));

    console.log({ jsChunks });

    res.status(200).send(
      `<!doctype html>
<html lang="">
  <head>
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta charSet='utf-8' />
    <title>Welcome to Razzle</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    ${
      cssChunks.length > 0
        ? cssChunks
            .map(style => {
              return `<link href="${style.file}" rel="stylesheet"/>`;
            })
            .join('\n')
        : ''
    }
  </head>
  <body>
    <div id="root">${markup}</div>
    ${
      jsChunks.length > 0
        ? jsChunks
            .map(
              chunk =>
                process.env.NODE_ENV === 'production'
                  ? `<script src="/${chunk.file}"></script>`
                  : `<script src="http://${process.env.HOST}:${parseInt(process.env.PORT, 10) + 1}/${
                      chunk.file
                    }" crossorigin></script>`,
            )
            .join('\n')
        : ''
    }
    <script>window.main();</script>
  </body>
</html>`,
    );
  });

export default server;
