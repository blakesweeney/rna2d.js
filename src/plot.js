/** @module plot */
'use strict';

import { Accessible } from './component.js';
var d3 = require('d3');

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
const DEFAULTS = {
  labels: [],
  margin: { left: 10, right: 10, above: 10, below: 10 },
  view: 'circular',
  width: 500,
  height: 1000,
  selection: null,
  xScale: null,
  yScale: null,
  'class': 'rna2d',
};

export default class Plot extends Accessible {

  constructor(config) {
    const conf = new Map();
    Object.keys(DEFAULTS).forEach((key) => {
      conf.set(key, config[key] || DEFAULTS[key]);
    });
    super(conf);
    this.vis = null;
    this._components = [];
    this._views = {};
    this._currentView = null;
  }

  /**
   * Draw the plot. This will setup the SVG and then render all components
   * followed by drawing the selected view. Components are drawn in an arbitrary
   * order, so if there should be no dependencies between them.
   */
  draw() {
    const view = this.currentView();
    if (!view) {
      throw new Error('Could not find view');
    }

    // Setup the drawing area
    const margin = this.margin();
    let selection = this.selection();
    if (typeof selection === 'string') {
      selection = d3.select(selection);
    }

    selection
      .select('svg')
      .remove();

    const top = selection.append('svg')
      .classed(this.class(), true)
      .attr('width', this.width())
      .attr('height', this.height());

    this.vis = top.append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.above + ')');

    // Generate the view
    view.preprocess();

    // Setup the scales
    const scales = this.scales();
    this.xScale(scales.x);
    this.yScale(scales.y);

    // Generate the components - brush, frame, zoom, etc
    this._components.forEach((component) => component.generate());

    view.generate(this.vis);
    return this;
  }

  scales() {
    const view = this.currentView();
    const margin = this.margin();
    const scale = (d, m) => d3.scale.linear().domain(d).range([0, m]);
    return {
      x: scale(view.domain.x, this.width() - (margin.right + margin.left)),
      y: scale(view.domain.y, this.height() - (margin.above + margin.above)),
    };
  }

  currentView() {
    return this[this.view()];
  }

  /**
   * Register a Component or View. If the
   *
   * @this {Plot}
   * @returns {Plot} Returns the plot itself.
   */
  register(Klass) {
    const obj = new Klass(this);
    this[obj._name] = obj;
    return this;
  }

  /**
   * Register all Components or Views.
   *
   * @this {Plot}
   * @returns {Plot} Returns the plot itself.
   */
  registerAll(iterable) {
    iterable.forEach((v) => this.register(v));
    return this;
  }

}
