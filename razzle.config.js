const { ReactLoadablePlugin } = require('react-loadable/webpack');

module.exports = {
  modify: (config, { target }) => {
    if (target === 'web') {
      return {
        ...config,
        plugins: [
          ...config.plugins,
          new ReactLoadablePlugin({
            filename: './build/react-loadable.json',
          }),
        ],
      };
    }

    const cfg = config.module.rules[2].use[0];

    // cfg.options.plugins = [
    //   ...(cfg.options.plugins || []),
    //   // ["import", { "libraryName": "antd", "libraryDirectory": "es", "style": "css" }],
    //   ['import', { libraryName: 'antd', libraryDirectory: 'lib', style: name => `${name}/style/index.css` }],
    // ];

    console.log(cfg.options.plugins);

    return config;
  },
};
