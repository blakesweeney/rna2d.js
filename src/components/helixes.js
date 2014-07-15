/** @module components/motifs */
'use strict';

var mixins = require('../mixins.js'),
    utils = require('../utils.js'),
    Component = require('../component.js');

var DEFAULTS = {
  click: Object,
  mouseover: Object,
  mouseout: Object,
  highlight: Object,
  normalize: Object,
  getID: function(d) { return d.id; },
  color: function(d) { return d.color || 'black'; },
  visible: function() { return true; },
  highlightColor: function() { return 'red'; },

  'class': 'helix-label',
  classOf: function() { return []; },
  getNTs: function(d) { return d.nts; },
  getText: function(d) { return d.text; },
  getX: function(d) { return d.x; },
  getY: function(d) { return d.y; },
  encodeID: function(id) { return id; },
};

var Helixes = utils.inhert(Component, 'helixes', DEFAULTS);

mixins.withIdElement.call(Helixes.prototype);
mixins.withNTElements.call(Helixes.prototype);
mixins.asToggable.call(Helixes.prototype);
mixins.asColorable.call(Helixes.prototype);
mixins.withAttrs.call(Helixes.prototype);

Helixes.prototype.colorByHelix = function() {
  var ntColor = this.plot.nucleotides.color(),
      getNTs = this.getNTs(),
      getNTID = this.plot.nucleotides.getID(),
      helixColor = this.color(),
      ntMap = {};

  this.data().forEach(function(helix, i) {
    getNTs(helix, i).forEach(function(nt) {
      ntMap[nt] = [helix, i];
    });
  });

  this.plot.nucleotides.color(function(d, i) {
    var data = ntMap[getNTID(d, i)];
    return (data ? helixColor.apply(this, data) : 'black');
  });

  this.colorize();
  this.plot.nucleotides.colorize();
  this.plot.nucleotides.color(ntColor);

  return this;
};

module.exports = function() {
  var helixes = new Helixes();

  helixes.defaultHighlight = function(d, i) {
    var data = [];
    helixes.nucleotides(d, i)
      .datum(function(d) { data.push(d); return d; });
    helixes.plot.currentView().highlightLetters(data, true);
  };

  helixes.defaultNormalize = function() {
    helixes.plot.currentView().clearHighlightLetters();
  };

  return helixes;
};
