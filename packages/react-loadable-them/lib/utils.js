"use strict";

var crypto = require('crypto');

/**
 * See {@link https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity|Subresource Integrity} at MDN
 *
 * @param  {array} algorithms - The algorithms you want to use when hashing `content`
 * @param  {string} source - File contents you want to hash
 * @return {string} SRI hash
 */
var computeIntegrity = function computeIntegrity(algorithms, source) {
  return Array.isArray(algorithms) ? algorithms.map(function (algorithm) {
    var hash = crypto.createHash(algorithm).update(source, "utf8").digest("base64");
    return algorithm + "-" + hash;
  }).join(' ') : '';
};

module.exports = {
  computeIntegrity: computeIntegrity
};