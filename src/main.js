/**
 * @overview 
 * Rna2D
 * @project Rna2D
 */

require('es5-shim');

var Plot = require('./plot.js'),
    views = require('./views.js'),
    components = require('./components.js');

module.exports = function(config) {
  'use strict';
  var plot = new Plot(config);
  return plot
    .registerAll(components)
    .registerAll(views);
};
