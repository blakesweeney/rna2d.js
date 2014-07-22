'use strict';

module.exports.load = function(name) {
  return require('../src/' + name + '.js');
};
