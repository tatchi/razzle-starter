'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var fs = require('fs');
var path = require('path');
var url = require('url');

function buildManifest(compiler, compilation) {
  var context = compiler.options.context;
  var manifest = {};

  for (var _iterator = compilation.chunkGroups, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
    var _ref;

    if (_isArray) {
      if (_i >= _iterator.length) break;
      _ref = _iterator[_i++];
    } else {
      _i = _iterator.next();
      if (_i.done) break;
      _ref = _i.value;
    }

    var chunkGroup = _ref;

    var files = [];
    for (var _iterator2 = chunkGroup.chunks, _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator]();;) {
      var _ref2;

      if (_isArray2) {
        if (_i2 >= _iterator2.length) break;
        _ref2 = _iterator2[_i2++];
      } else {
        _i2 = _iterator2.next();
        if (_i2.done) break;
        _ref2 = _i2.value;
      }

      var chunk = _ref2;

      for (var _iterator4 = chunk.files, _isArray4 = Array.isArray(_iterator4), _i4 = 0, _iterator4 = _isArray4 ? _iterator4 : _iterator4[Symbol.iterator]();;) {
        var _ref4;

        if (_isArray4) {
          if (_i4 >= _iterator4.length) break;
          _ref4 = _iterator4[_i4++];
        } else {
          _i4 = _iterator4.next();
          if (_i4.done) break;
          _ref4 = _i4.value;
        }

        var file = _ref4;

        var publicPath = url.resolve(compilation.outputOptions.publicPath || '', file);
        files.push({
          file: file,
          publicPath: publicPath,
          chunkName: chunk.name
        });
      }
    }

    var _loop = function _loop() {
      if (_isArray3) {
        if (_i3 >= _iterator3.length) return 'break';
        _ref3 = _iterator3[_i3++];
      } else {
        _i3 = _iterator3.next();
        if (_i3.done) return 'break';
        _ref3 = _i3.value;
      }

      var block = _ref3;

      var name = void 0;
      var id = null;
      var dependency = block.module.dependencies.find(function (dep) {
        return block.request === dep.request;
      });

      if (dependency) {
        var module = dependency.module;
        id = module.id;
        name = typeof module.libIdent === 'function' ? module.libIdent({ context: context }) : null;
      }

      for (var _iterator5 = files, _isArray5 = Array.isArray(_iterator5), _i5 = 0, _iterator5 = _isArray5 ? _iterator5 : _iterator5[Symbol.iterator]();;) {
        var _ref5;

        if (_isArray5) {
          if (_i5 >= _iterator5.length) break;
          _ref5 = _iterator5[_i5++];
        } else {
          _i5 = _iterator5.next();
          if (_i5.done) break;
          _ref5 = _i5.value;
        }

        var _file = _ref5;

        _file.id = id;
        _file.name = name;
      }

      manifest[block.request] = files;
    };

    for (var _iterator3 = chunkGroup.blocksIterable, _isArray3 = Array.isArray(_iterator3), _i3 = 0, _iterator3 = _isArray3 ? _iterator3 : _iterator3[Symbol.iterator]();;) {
      var _ref3;

      var _ret = _loop();

      if (_ret === 'break') break;
    }
  }

  return manifest;
}

var ReactLoadablePlugin = function () {
  function ReactLoadablePlugin() {
    var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, ReactLoadablePlugin);

    this.filename = opts.filename;
  }

  ReactLoadablePlugin.prototype.apply = function apply(compiler) {
    var _this = this;

    compiler.hooks.emit.tapAsync('ReactLoadablePlugin', function (compilation, callback) {
      var manifest = buildManifest(compiler, compilation);
      var json = JSON.stringify(manifest, null, 2);
      var outputDirectory = path.dirname(_this.filename);
      try {
        fs.mkdirSync(outputDirectory);
      } catch (err) {
        if (err.code !== 'EEXIST') {
          throw err;
        }
      }
      fs.writeFileSync(_this.filename, json);
      callback();
    });
  };

  return ReactLoadablePlugin;
}();

function getBundles(manifest, moduleIds) {
  return moduleIds.reduce(function (bundles, moduleId) {
    return bundles.concat(manifest[moduleId]);
  }, []);
}

exports.ReactLoadablePlugin = ReactLoadablePlugin;
exports.getBundles = getBundles;