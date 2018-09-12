'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var fs = require('fs');
var path = require('path');
var url = require('url');

var _require = require('./utils'),
    computeIntegrity = _require.computeIntegrity;

var PLUGIN_NAME = 'ReactLoadablePlugin';

var defaultOptions = {
  filename: 'react-loadable.json',
  integrity: false,
  integrityAlgorithms: ['sha256', 'sha384', 'sha512'],
  integrityPropertyName: 'integrity'
};

var ReactLoadablePlugin = function () {
  function ReactLoadablePlugin() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultOptions;

    _classCallCheck(this, ReactLoadablePlugin);

    this.options = _extends({}, defaultOptions, options);
    this.compiler = null;
    this.stats = null;
    this.entrypoints = new Set();
    this.assetsByName = new Map();
    this.manifest = {};
  }

  ReactLoadablePlugin.prototype.getAssets = function getAssets(assetsChunk) {
    var _this = this;

    assetsChunk.forEach(function (chunk) {
      var id = chunk.id,
          files = chunk.files,
          _chunk$siblings = chunk.siblings,
          siblings = _chunk$siblings === undefined ? [] : _chunk$siblings,
          hash = chunk.hash;

      var key = _this.getChunkKey(chunk) || chunk.names.length > 0 && chunk.names[0] || id;

      _this.assetsByName.set(key, { id: id, files: files, hash: hash, siblings: siblings });
    });

    return this.assetsByName;
  };

  ReactLoadablePlugin.prototype.getEntrypoints = function getEntrypoints(entrypoints) {
    var _this2 = this;

    Object.keys(entrypoints).forEach(function (entry) {
      return _this2.entrypoints.add(entry);
    });
    return this.entrypoints;
  };

  ReactLoadablePlugin.prototype.isRequestFromDevServer = function isRequestFromDevServer() {
    if (process.argv.some(function (arg) {
      return arg.includes('webpack-dev-server');
    })) {
      return true;
    }
    return this.compiler.outputFileSystem && this.compiler.outputFileSystem.constructor.name === 'MemoryFileSystem';
  };

  ReactLoadablePlugin.prototype.getFileExtension = function getFileExtension(filename) {
    if (!filename || typeof filename !== 'string') {
      return '';
    }

    var fileExtRegex = /\.\w{2,4}\.(?:map|gz)$|\.\w+$/i;

    filename = filename.split(/[?#]/)[0];
    var ext = filename.match(fileExtRegex);

    return ext && ext.length ? ext[0] : '';
  };

  ReactLoadablePlugin.prototype.getChunkKey = function getChunkKey(chunk) {
    var key = null;

    for (var i = 0; i < chunk.modules.length; i++) {
      var reasons = chunk.modules[i].reasons;

      for (var j = 0; j < reasons.length; j++) {
        var _reasons$j = reasons[j],
            type = _reasons$j.type,
            userRequest = _reasons$j.userRequest;

        if (type === 'import()') {
          key = userRequest;
          break;
        }
      }
      if (key) break;
    }

    return key;
  };

  ReactLoadablePlugin.prototype.getManifestOutputPath = function getManifestOutputPath() {
    if (path.isAbsolute(this.options.filename)) {
      return this.options.filename;
    }

    if (this.isRequestFromDevServer()) {
      var outputPath = this.compiler.options.devServer.outputPath || this.compiler.outputPath || '/';

      if (outputPath === '/') {
        console.warn('Please use an absolute path in options.output when using webpack-dev-server.');
        outputPath = this.compiler.context || process.cwd();
      }

      return path.resolve(outputPath, this.options.filename);
    }

    return path.resolve(this.compiler.outputPath, this.options.filename);
  };

  ReactLoadablePlugin.prototype.apply = function apply(compiler) {
    this.compiler = compiler;
    if (compiler.hooks) {
      compiler.hooks.emit.tapAsync(PLUGIN_NAME, this.handleEmit.bind(this));
    } else {
      compiler.plugin('emit', this.handleEmit.bind(this));
    }
  };

  ReactLoadablePlugin.prototype.handleEmit = function handleEmit(compilation, callback) {
    this.stats = compilation.getStats().toJson();
    this.options.publicPath = (compilation.outputOptions ? compilation.outputOptions.publicPath : compilation.options.output.publicPath) || '';
    this.getEntrypoints(this.stats.entrypoints);
    this.getAssets(this.stats.chunks);
    this.processAssets(compilation.assets);
    this.writeAssetsFile();

    callback();
  };

  ReactLoadablePlugin.prototype.processAssets = function processAssets(originAssets) {
    var _this3 = this;

    var assets = {};
    var origins = {};
    var entrypoints = this.entrypoints;

    var _loop = function _loop() {
      if (_isArray) {
        if (_i >= _iterator.length) return 'break';
        _ref = _iterator[_i++];
      } else {
        _i = _iterator.next();
        if (_i.done) return 'break';
        _ref = _i.value;
      }

      var _ref2 = _ref,
          key = _ref2[0],
          _ref2$ = _ref2[1],
          files = _ref2$.files,
          id = _ref2$.id,
          siblings = _ref2$.siblings,
          hash = _ref2$.hash;

      files.forEach(function (file) {
        var currentAsset = originAssets[file];
        var ext = _this3.getFileExtension(file).replace(/^\.+/, '').toLowerCase();

        if (!assets[id]) {
          assets[id] = {};
        }
        if (!assets[id][ext]) {
          assets[id][ext] = [];
        }
        if (!origins[key]) {
          origins[key] = [];
        }

        if (currentAsset && _this3.options.integrity && !currentAsset[_this3.options.integrityPropertyName]) {
          currentAsset[_this3.options.integrityPropertyName] = computeIntegrity(_this3.options.integrityAlgorithms, currentAsset.source());
        }

        siblings.push(id);
        siblings.forEach(function (sibling) {
          if (!origins[key].includes(sibling)) {
            origins[key].push(sibling);
          }
        });

        assets[id][ext].push({
          file: file,
          hash: hash,
          publicPath: url.resolve(_this3.options.publicPath || '', file),
          integrity: currentAsset[_this3.options.integrityPropertyName]
        });
      });
    };

    for (var _iterator = this.assetsByName, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
      var _ref;

      var _ret = _loop();

      if (_ret === 'break') break;
    }

    this.manifest = {
      entrypoints: Array.from(entrypoints),
      origins: origins,
      assets: assets
    };
  };

  ReactLoadablePlugin.prototype.writeAssetsFile = function writeAssetsFile() {
    var filePath = this.getManifestOutputPath();
    var fileDir = path.dirname(filePath);
    var json = JSON.stringify(this.manifest, null, 2);
    try {
      if (!fs.existsSync(fileDir)) {
        fs.mkdirSync(fileDir);
      }
    } catch (err) {
      if (err.code !== 'EEXIST') {
        throw err;
      }
    }

    fs.writeFileSync(filePath, json);
  };

  return ReactLoadablePlugin;
}();

function getBundles(manifest, chunks) {
  var assetsKey = chunks.reduce(function (key, chunk) {
    if (manifest.origins[chunk]) {
      key = [].concat(key, manifest.origins[chunk]);
    }
    return key;
  }, []);

  return assetsKey.reduce(function (bundle, asset) {
    Object.keys(manifest.assets[asset]).forEach(function (key) {
      var content = manifest.assets[asset][key];
      if (!bundle[key]) {
        bundle[key] = [];
      }
      bundle[key] = [].concat(bundle[key], content);
    });
    return bundle;
  }, {});
}

exports.ReactLoadablePlugin = ReactLoadablePlugin;
exports.getBundles = getBundles;