const ExtractCssChunks = require('extract-css-chunks-webpack-plugin');
const path = require('path');
const fs = require('fs');

module.exports = {
  plugins: [{ func: require('razzle-plugin-less') }],
  modify: (defaultConfig, { target, dev }, webpack, userOptions = {}) => {
    const isServer = target !== 'web';
    const constantEnv = dev ? 'dev' : 'prod';
    let config = Object.assign({}, defaultConfig);

    if (target === 'web') {
      config.plugins = [
        ...config.plugins,
        {
          apply: compiler => {
            const pathName = './build/stats.json';
            compiler.plugin('emit', (curCompiler, callback) => {
              const json = JSON.stringify(curCompiler.getStats().toJson(), null, 2);
              const outputDirectory = path.dirname(pathName);
              try {
                fs.mkdirSync(outputDirectory);
              } catch (err) {
                if (err.code !== 'EEXIST') {
                  throw err;
                }
              }
              fs.writeFileSync(pathName, json);
              callback();
            });
          },
        },
      ];

      if (!dev) {
        config.plugins = config.plugins.filter(p => p.constructor.name !== 'AggressiveMergingPlugin');
      }
    }

    let rules = config.module.rules;

    const loaderName = 'mini-css-extract-plugin';
    const loaderRegex = new RegExp(`[/\\\\]${loaderName}[/\\\\]`);

    rules.forEach((rule, iRule) => {
      if (rule.use) {
        rule.use.forEach((loader, iLoader) => {
          if (loader && typeof loader === 'string' && loaderRegex.test(loader)) {
            rules[iRule].use[iLoader] = ExtractCssChunks.loader;
          }
        });
      }
    });

    config.plugins.forEach((p, i) => {
      if (p.constructor.name === 'MiniCssExtractPlugin') {
        config.plugins[i] = new ExtractCssChunks({ ...p.options });
      }
    });

    return config;
  },
};
