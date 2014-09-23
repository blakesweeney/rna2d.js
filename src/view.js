/** @module view */
'use strict';

var utils = require('./utils.js'),
    Component = require('./component');

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
function View(name, config, domain) {
  Component.call(this, name, config);
  this.domain = domain || { x: null, y: null };
}
View.prototype = Object.create(Component);
View.prototype.constructor = View;

/**
 * Attach the view to a plot.
 *
 * @this {View}
 * @param {Plot} plot The plot to attach to.
 */
View.prototype.attach = function(plot) {
  // plot[this._name] = this;
  this.plot = plot;

  plot[this._name] = {};
  Object.keys(this).forEach(function(prop) {
    if (this.hasOwnProperty(prop) && prop[0] !== '_') {
      plot[this._name][prop] = this[prop];
    }
  });
};

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

View.prototype.xCoord = function() { return false; };
View.prototype.yCoord = function() { return false; };

View.prototype.update = function() { return false; };
View.prototype.preprocess = function() { return false; };

View.prototype.chainData = function(s) { return s; };
View.prototype.coordinateData = function(s) { return s; };
View.prototype.connectionData = function(s) { return s; };
View.prototype.groupData = function(s) { return s; };
View.prototype.helixData = function(s) { return s; };

View.prototype.coordinates = function() {
  var plot = this.plot,
      x = this.xCoord(),
      y = this.yCoord();

  var sele = plot.vis.selectAll(plot.chains['class']())
    .append('g')
    .attr('id', 'all-chains')
    .data(plot.chains()).enter()
      .append('g')
      .attr('id', 'all-nts')
      .call(this.chainData)
      .call(utils.generateStandardAttrs(plot.chains))
      .selectAll(plot.nucleotides['class']())
      .data(plot.chains.getNTData()).enter();

  return this.coordinateData(sele)
    .call(utils.generateStandardAttrs(plot.nucleotides))
    .datum(function(d, i) {
      d.__x = x(d, i);
      d.__y = y(d, i);
      return d;
    });
};

View.prototype.connections = function() {
  var plot = this.plot,
      sele = plot.vis.selectAll(plot.interactions['class']())
        .data(plot.interactions.valid(this.interactionValidator)).enter();

  return this.connectionData(sele)
    .call(utils.generateStandardAttrs(plot.interactions));
};

View.prototype.groups = function() {
  var plot = this.plot,
      sele = plot.vis.selectAll(plot.motifs['class']())
        .append('g')
        .attr('id', 'all-motifs')
        .data(plot.motifs.valid(this.groupsValidator)).enter();

  this.groupData(sele)
    .attr('missing-nts', function(d) { return d.__missing.join(' '); })
    .call(utils.generateStandardAttrs(plot.motifs));
};

View.prototype.helixes = function() {
  var plot = this.plot,
      data = plot.helixes() || [];

  plot.vis.selectAll(plot.helixes['class']())
    .append('g')
    .attr('id', 'all-helixes')
    .data(data).enter()
      .append('svg:text')
      .text(plot.helixes.getText())
      .attr('fill', plot.helixes.color())
      .call(this.helixData)
      .call(utils.generateStandardAttrs(plot.helixes));
};

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
      .call(utils.generateStandardAttrs(plot.highlights));
};

View.prototype.clearHighlightLetters = function() {
  this.plot.vis.selectAll('.' + this.plot.highlights['class']()).remove();
  return this;
};

View.prototype.interactionValidator = function(o) { return o; };
View.prototype.groupsValidator = function(o) { return o; };

module.exports = View;
