import App from './App';
import React from 'react';
import { Capture } from 'react-loadable';
import { StaticRouter } from 'react-router-dom';
import express from 'express';
import { renderToString } from 'react-dom/server';
import webpackStats from '../build/stats.json';
import { join } from 'upath';

const assets = require(process.env.RAZZLE_ASSETS_MANIFEST);

const server = express();
server
  .disable('x-powered-by')
  .use(express.static(process.env.RAZZLE_PUBLIC_DIR))
  .get('/*', (req, res) => {
    const context = {};
    let modules = [];

    // clearChunks();

    const markup = renderToString(
      <Capture report={moduleName => modules.push(moduleName)}>
        <StaticRouter context={context} location={req.url}>
          <App />
        </StaticRouter>
      </Capture>,
    );

    // const { js, styles, cssHash, Js, scripts } = flushChunks(webpackStats, {
    //   chunkNames: flushChunkNames(),
    // });

    const clientJs = webpackStats.namedChunkGroups.client.assets.filter(asset => asset.endsWith('.js'));
    const clientCss = webpackStats.namedChunkGroups.client.assets.filter(asset => asset.endsWith('.css'));

    const getNameFromModule = module => module.split('/')[1];

    const moduleNames = modules.map(getNameFromModule);

    const jsChunks = moduleNames.reduce(
      (acc, moduleName) => [
        ...acc,
        ...webpackStats.namedChunkGroups[moduleName].assets.filter(asset => asset.endsWith('.js')),
      ],
      [],
    );
    const cssChunks = moduleNames.reduce(
      (acc, moduleName) => [
        ...acc,
        ...webpackStats.namedChunkGroups[moduleName].assets.filter(asset => asset.endsWith('.css')),
      ],
      [],
    );

    console.log({ moduleNames });
    console.log({ jsChunks });
    console.log({ cssChunks });
    console.log({ clientJs });
    console.log({ clientCss });

    if (context.url) {
      res.redirect(context.url);
    } else {
      // const bundles = getBundles(stats, modules);
      // // console.log(modules);
      // const chunks = bundles.filter(bundle => bundle.file.endsWith('.js'));
      // const styles = bundles.filter(bundle => bundle.file.endsWith('.css'));
      // console.log(styles);
      res.status(200).send(
        `<!doctype html>
<html lang="">
  <head>
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta charSet='utf-8' />
    <title>Welcome to Razzle</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    ${clientCss.length > 0 ? clientCss.map(asset => `<link rel="stylesheet" href="${asset}">`).join('\n') : ''}
    ${
      cssChunks.length > 0
        ? cssChunks
            .map(style => {
              return `<link href="${style}" rel="stylesheet"/>`;
            })
            .join('\n')
        : ''
    }
  </head>
  <body>
    <div id="root">${markup}</div>
    ${
      clientJs.length > 0
        ? clientJs
            .map(
              asset =>
                process.env.NODE_ENV === 'production'
                  ? `<script src="${asset}"></script>`
                  : `<script src="${asset}" crossorigin></script>`,
            )
            .join('\n')
        : ''
    }
          ${
            jsChunks.length > 0
              ? jsChunks
                  .map(
                    chunk =>
                      process.env.NODE_ENV === 'production'
                        ? `<link href="/${chunk}" rel="preload"></link>`
                        : `<script src="http://${process.env.HOST}:${parseInt(process.env.PORT, 10) +
                            1}/${chunk}"></script>`,
                  )
                  .join('\n')
              : ''
          }
  </body>
</html>`,
      );
    }
  });

export default server;
