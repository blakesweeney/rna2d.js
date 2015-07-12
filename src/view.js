/** @module view */

import utils from './utils.js';
import { Component } from './component.js';

export default class View extends Component {

  /**
   * Creates a new View.
   *
   * @constructor
   * @this {View}
   * @param {string} name The name to give the view.
   * @param {object} config The config object.
   * @param {object} domain The optional domain. If not given a default one will
   * be added.
   */
  constructor(name, config, domain) {
    super(name, config);
    this.domain = domain || { x: null, y: null };
  }

  /**
   * Return a function which attaches the standard handlers and sets standard
   * attributes of elements in a selection for a view. This will set the id,
   * class and visibility of the given element. It will then add all
   * attrirbutes. It also attaches all event handlers.
   *
   *
   * @param {Component} type A Component to generate the function for.
   * @returns {function} A function to set attributes and handlers.
   */
  generateStandardViewAttrs(type) {
    return function(selection) {
      var klass = type['class'](),
          classOf = type.classOf();

      utils.attachHandlers(selection, type);

      return selection
        .attr('id', type.elementID())
        .attr('class', function(d, i) {
          return classOf(d, i).concat(klass).join(' ');
        })
        .attr('visibility', type.visibility())
        .call(type.applyAttrs);
    };
  }

  /**
   * Attach the view to a plot.
   *
   * @this {View}
   * @param {Plot} plot The plot to attach to.
   */
  attach(plot) {
    this.plot = plot;

    plot[this._name] = {};
    Object.keys(this).forEach(function(prop) {
      if (this.hasOwnProperty(prop) && prop[0] !== '_') {
        plot[this._name][prop] = this[prop];
      }
    });
  }

  /**
   * Return a function which computes the x coordinate for some data.
   *
   * @abstract
   * @this {View}
   */
  xCoord() { return false; }
}

/**
 * Generate the view. This draws the coordinates, then connections, then groups,
 * then helixes.
 *
 * @this {View}
 */
View.prototype.generate = function() {
  this.coordinates();
  this.connections();
  this.groups();
  this.helixes();
  this.update();
};
/**
 * Return a function which computes the y coordinate for some data.
 *
 * @abstract
 * @this {View}
 */
View.prototype.yCoord = function() { return false; };

/**
 *
 *
 * @abstract
 * @this {View}
 */
View.prototype.update = function() { return false; };

/**
 * Function to call prior to drawing the view. This is a good place to compute
 * things like the domain and extent of the data.
 *
 * @abstract
 * @this {View}
 */
View.prototype.preprocess = function() { return false; };

/**
 * This function is used to add any chain specific data to the chain object.
 * This is generally used for things like x and y coordinates, color, etc. The
 * data which is common to all chain elements, such as id, class, event handlers
 * and the like is added automatically. This need only compute and add the
 * things specific to this view.
 *
 * @abstract
 * @this {View}
 */
View.prototype.chainData = function(s) { return s; };

/**
 * This function is used to add any coordinate specific data to the chain
 * object. This is generally used for things like x and y coordinates,
 * color, etc. The data which is common to all coordinate elements, such as
 * id, class, event handlers and the like is added automatically. This need
 * only compute and add the things specific to this view.
 *
 * @abstract
 * @this {View}
 */
View.prototype.coordinateData = function(s) { return s; };

/**
 *
 *
 * @abstract
 * @this {View}
 */
View.prototype.connectionData = function(s) { return s; };

/**
 *
 *
 * @abstract
 * @this {View}
 */
View.prototype.groupData = function(s) { return s; };

/**
 *
 *
 * @abstract
 * @this {View}
 */
View.prototype.helixData = function(s) { return s; };

/**
 * This function is used to draw all chains. All chains are drawn under a single
 * g object. Below that is a g object for each chain. The defaults specified in
 * generateStandardAttrs
 *
 * @this {View}
 */
View.prototype.coordinates = function() {
  var plot = this.plot,
      x = this.xCoord(),
      y = this.yCoord();

  var sele = plot.vis.selectAll(plot.chains['class']())
    .append('g')
    .data(plot.chains()).enter()
      .append('g')
      .call(this.chainData)
      .call(this.generateStandardAttrs(plot.chains))
      .selectAll(plot.nucleotides['class']())
      .data(plot.chains.getNTData()).enter();

  return this.coordinateData(sele)
    .call(this.generateStandardAttrs(plot.nucleotides))
    .datum(function(d, i) {
      d.__x = x(d, i);
      d.__y = y(d, i);
      return d;
    });
};

/**
 *
 *
 * @this {View}
 */
View.prototype.connections = function() {
  var plot = this.plot,
      sele = plot.vis.selectAll(plot.interactions['class']())
        .data(plot.interactions.valid(this.interactionValidator)).enter();

  return this.connectionData(sele)
    .call(this.generateStandardAttrs(plot.interactions));
};

/**
 *
 *
 * @this {View}
 */
View.prototype.groups = function() {
  var plot = this.plot,
      sele = plot.vis.selectAll(plot.motifs['class']())
        .append('g')
        .data(plot.motifs.valid(this.groupsValidator)).enter();

  this.groupData(sele)
    .attr('missing-nts', function(d) { return d.__missing.join(' '); })
    .call(this.generateStandardAttrs(plot.motifs));
};

/**
 * This draws the helixes. Each helix
 *
 * @this {View}
 */
View.prototype.helixes = function() {
  var plot = this.plot,
      data = plot.helixes() || [];

  plot.vis.selectAll(plot.helixes['class']())
    .append('g')
    .data(data).enter()
      .append('svg:text')
      .text(plot.helixes.getText())
      .attr('fill', plot.helixes.color())
      .call(this.helixData)
      .call(this.generateStandardAttrs(plot.helixes));
};

/**
 *
 *
 * @this {View}
 */
View.prototype.highlightLetters = function(nts, lettersOnly) {
  var plot = this.plot,
      font_size = plot.highlights.size() / Math.sqrt(plot.zoom.currentScale());

  plot.vis.selectAll(plot.highlights['class']())
    .data(nts).enter()
      .append('svg:text')
      .attr('font-size', font_size)
      .attr('pointer-events', 'none')
      .text(plot.highlights.text()(lettersOnly))
      .attr('fill', plot.highlights.color())
      .attr('stroke', plot.highlights.color())
      .call(this.highlightLetterData)
      .call(this.generateStandardAttrs(plot.highlights));
};

/**
 *
 *
 * @this {View}
 */
View.prototype.clearHighlightLetters = function() {
  this.plot.vis.selectAll('.' + this.plot.highlights['class']()).remove();
  return this;
};

/**
 *
 *
 * @this {View}
 */
View.prototype.interactionValidator = function(o) { return o; };

/**
 *
 *
 * @this {View}
 */
View.prototype.groupsValidator = function(o) { return o; };

module.exports = View;
