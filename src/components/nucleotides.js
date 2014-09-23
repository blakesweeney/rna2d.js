/** @module components/nucleotides */
'use strict';

var mixins = require('../mixins.js'),
    utils = require('../utils.js'),
    Component = require('../component.js');

var DEFAULTS = {
  click: Object,
  mouseover: null,
  mouseout: null,
  visible: function() { return true; },
  highlight: Object,
  normalize: Object,
  highlightColor: function() { return 'red'; },
  getID: function(d) { return d.id; },
  'class': 'nucleotide',
  classOf: function(d) { return [d.sequence]; },
  getX: function(d) { return d.x; },
  getY: function(d) { return d.y; },
  encodeID: function(id) { return id; },
  getSequence: function(d) { return d.sequence; },
  getNumber: function(d) { return d.id.split('|')[4]; },
};

/**
 * Create a new NT Component. A nucleotide Component
 *
 * @constructor
 */
function NTs() { Component.call(this, 'nucleotides', DEFAULTS); }
NTs.prototype = Object.create(Component);
NTs.prototype.constructor = NTs;

mixins.withIdElement.call(NTs.prototype);
mixins.asToggable.call(NTs.prototype);
mixins.asColorable.call(NTs.prototype);
mixins.withAttrs.call(NTs.prototype, {color: 'black'});
mixins.hasData.call(NTs.prototype, null);
mixins.withInteractions.call(NTs.prototype);

/**
 * This exports a function which generates a Nucleotide component. This is based
 * off of the Nucleotide Component, but with mixins.
 */
module.exports = function() {

  var self = new NTs();

  self.defaultHighlight = function(d, i) {
    var highlightColor = self.plot.highlights.color()(d, i);
    self.plot._current_view.highlightLetters([d]);
    self.plot.nucleotides.interactions(d, i).style('stroke', highlightColor);
  };

  self.defaultNormalize = function(d, i) {
    self.plot._current_view.clearHighlightLetters();
    self.plot.nucleotides.interactions(d, i).style('stroke', null);
  };

  return self;
};
