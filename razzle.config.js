const { ReactLoadablePlugin } = require('react-loadable/webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ExtractCssChunks = require('extract-css-chunks-webpack-plugin');
const { StatsWriterPlugin } = require('webpack-stats-plugin');

module.exports = {
  modify: (defaultConfig, { target, dev }, webpack, userOptions = {}) => {
    const isServer = target !== 'web';
    const constantEnv = dev ? 'dev' : 'prod';
    let config = Object.assign({}, defaultConfig);

    let rules = config.module.rules;

    const loaderName = 'mini-css-extract-plugin';
    const loaderRegex = new RegExp(`[/\\\\]${loaderName}[/\\\\]`);

    console.log({ isServer });
    console.log({ constantEnv });
    // allLoaders = rules.filter(rule => rule.use).reduce((acc, rule) => [...acc, ...rule.use], []);
    // miniCssLoaders = allLoaders.filter(loader => loaderRegex.test(loader));

    // miniCssLoaders.forEach(element => {
    //   element = 'll';
    // });

    rules.forEach((rule, iRule) => {
      if (rule.use) {
        rule.use.forEach((loader, iLoader) => {
          if (loader && typeof loader === 'string' && loaderRegex.test(loader)) {
            rules[iRule].use[iLoader] = ExtractCssChunks.loader;
          }
        });
      }
    });

    // console.log(config.module.rules.filter(rule => rule.use).reduce((acc, rule) => [...acc, ...rule.use], []));

    config.plugins.forEach((p, i) => {
      if (p instanceof MiniCssExtractPlugin) {
        config.plugins[i] = new ExtractCssChunks({ ...p.options });
      }
    });

    if (target === 'web') {
      config.plugins = [
        ...config.plugins,
        new StatsWriterPlugin({
          fields: null,
          filename: '../stats.json', // Default
        }),
      ];
    }

    console.log(config.plugins);

    return config;
  },
};
