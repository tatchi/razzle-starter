import App from './App';
import React from 'react';
import { Capture } from 'react-loadable';
import polka from 'polka';
import sirv from 'sirv';
import { renderStylesToString } from 'emotion-server'
import { renderToString } from 'react-dom/server';
import { ServerLocation, isRedirect } from '@reach/router';
import { getBundles } from 'react-loadable-ssr-addon';
import stats from '../build/react-loadable.json';
const compress = require('compression')();

const assets = require(process.env.RAZZLE_ASSETS_MANIFEST);

const publicAssets = sirv(process.env.RAZZLE_PUBLIC_DIR, {
  maxAge: 31536000, // 1Y
  immutable: true, // should only be set in prod I think
});

export default polka()
  // .disable('x-powered-by')
  // .use(express.static(process.env.RAZZLE_PUBLIC_DIR))
  .use(compress, publicAssets)
  // .use(serve(process.env.RAZZLE_PUBLIC_DIR))
  .get('/*', (req, res) => {
    let modules = [];
    let markup;

    try {
      markup = renderStylesToString(
        renderToString(
          <Capture report={moduleName => modules.push(moduleName)}>
            <ServerLocation url={req.url}>
              <App />
            </ServerLocation>
          </Capture>,
        ),
      );
    } catch (error) {
      if (isRedirect(error)) {
        res.redirect(error.uri);
      }
      console.log({ error });
    }

    const modulesToBeLoaded = [...stats.entrypoints, ...Array.from(modules)];

    let bundles = getBundles(stats, modulesToBeLoaded);

    const jsChunks = bundles.js || [];
    const cssChunks = bundles.css || [];

    res.end(
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
  }).handler;
