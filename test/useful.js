'use strict';

// var jsdom = require('jsdom');

module.exports.load = function(name) {
  return require('../src/' + name + '.js');
};

// module.exports.document = function() {
//   return jsdom.jsdom('<html><head></head><body></body></html>');
// };
