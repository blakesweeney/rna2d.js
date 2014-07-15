/** @module plot */
'use strict';

var utils = require('./utils.js'),
    extend = require('extend'),
    d3 = require('d3');

/**
 * The defaults for the plot config.
 *
 * @property {array} labels
 * @property {object} margin        - An object representing the margins to add
 * @property {number} margin.left   - Space to the left of the drawing area
 * @property {number} margin.right  - Space to the right of the drawing area
 * @property {number} margin.above  - Space above the drawing area
 * @property {number} margin.below  - Space below the drawing area
 * @property {string} view          - The name of the view to use
 * @property {number} width         - Width of the plot
 * @property {number} height        - Height of the plot
 * @property {selection} string     - Selector to use for drawing
 * @property {function} xScale      - Function to compute the x scale
 * @property {function} yScale      - Function to compute the y scale
 */
var DEFAULTS = {
    labels: [],
    margin: { left: 10, right: 10, above: 10, below: 10 },
    view: 'circular',
    width:  500,
    height: 1000,
    selection: null,
    xScale: null,
    yScale: null
};

/**
 * Create a new Plot.
 *
 * @constructor
 */
var Plot = function(config) {
  utils.generateAccessors(this, extend(DEFAULTS, config));
  this.vis = null;
  this._components = [];
  this._views = {};
  this._current_view = null;
};

/**
 * Draw the plot. This will setup the SVG and then render all components
 * followed by drawing the selected view. Components are drawn in an arbitrary
 * order, so if there should be no dependencies between them.
 */
Plot.prototype.draw = function() {
  // Setup the drawing area
  var margin = this.margin(),
      selection = d3.select(this.selection());

  selection.select('svg').remove();
  var top = selection.append('svg')
    .attr('width', this.width() + margin.left + margin.right)
    .attr('height', this.height() + margin.above + margin.below);

  this.vis = top.append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.above + ')');

  if (!this._views.hasOwnProperty(this.view())) {
    throw new Error('Unknown View');
  }

  // Generate the view
  var view = new this._views[this.view()](),
      scale = function(domain, max) {
    return d3.scale.linear().domain(domain).range([0, max]);
  };

  view.plot = this;
  this._current_view = view;
  view.preprocess();

  // Setup the scales
  this.xScale(scale(view.domain.x, this.width() - margin.right));
  this.yScale(scale(view.domain.y, this.height() - margin.above));

  // Generate the components - brush, frame, zoom, etc
  this._components.forEach(function(component) { component.generate(); });

  view.generate();
  return this;
};

/**
 * Register a Component or View. If the 
 *
 * @this {Plot}
 * @returns {Plot} Returns the plot itself.
 */
Plot.prototype.register = function(obj) {
  obj.plot = this;
  this[obj._name] = obj;
  return this;
};

/**
 * Register all Components or Views.
 *
 * @this {Plot}
 * @returns {Plot} Returns the plot itself.
 */
Plot.prototype.registerAll = function(mapping) {
  var self = this;
  Object.keys(mapping).forEach(function(key) {
    self.register(mapping[key]);
  });
  return this;
};

module.exports = Plot;
