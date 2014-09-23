/** @module components/interactions */
'use strict';

var mixins = require('../mixins.js'),
    d3 = require('d3'),
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
  color: 'black',

  getFamily: function(d) { return d.family; },
  getNTs: function(d) { return [d.nt1, d.nt2]; },
  'class': 'interaction',
  classOf: function(d) { return [d.family]; },
  encodeID: function(id) { return id; },
};

function Interactions() { Component.call(this, 'interactions', DEFAULTS); };
Interactions.prototype = Object.create(Component);
Interactions.prototype.constructor = Interactions;

mixins.withIdElement.call(Interactions.prototype);
mixins.asToggable.call(Interactions.prototype);
mixins.asColorable.call(Interactions.prototype);
mixins.withAttrs.call(Interactions.prototype);
mixins.hasData.call(Interactions.prototype);
mixins.withNTElements.call(Interactions.prototype);
mixins.canValidate.call(Interactions.prototype);

Interactions.prototype.isForward = function() {
  var self = this;
  return function(d) {
    var family = self.getFamily()(d);
    if (family.length === 3) {
      family = family.slice(1, 3).toUpperCase();
    } else {
      family = family.slice(2, 4).toUpperCase();
    }
    return family === 'WW' || family === 'WH' || family === 'WS' ||
           family === 'HH' || family === 'SH' || family === 'SS';
  };
};

Interactions.prototype.isSymmetric = function() {
  var self = this;
  return function(d, i) {
    var family = self.getFamily()(d, i);
    return family[1] === family[2];
  };
};

Interactions.prototype.validator = function() {
  var self = this,
      getNts = self.getNTs(),
      isForward = self.isForward(),
      encodeID = self.encodeID(),
      bboxOf = function(id) {
        return document.getElementById(encodeID(id));
      };
  return function(d, i) {
    var nts = getNts(d, i);
    return isForward(d, i) && nts.length &&
      bboxOf(nts[0]) !== null && bboxOf(nts[1]) !== null;
  };
};

Interactions.prototype.iscWW = function() {
  var self = this;
  return function(d, i) {
    var family = self.getFamily()(d, i);
    return family === 'cWW' || family === 'ncWW';
  };
};

module.exports = function() {
  var interactions = new Interactions();

  interactions.defaultHighlight = function(d, i) {
    var highlightColor = interactions.plot.interactions.highlightColor()(d, i),
    ntData = [];

    d3.select(this).style('stroke', highlightColor);

    interactions.nucleotides(d, i)
      .datum(function(d) { ntData.push(d); return d; });
    interactions.plot.currentView().highlightLetters(ntData);

    return interactions;
  };

  interactions.defaultNormalize = function() {
    d3.select(this).style('stroke', null);
    interactions.plot.currentView().clearHighlightLetters();
    return interactions;
  };
  return interactions;
};
