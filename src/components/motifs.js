/** @module components/motifs */
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
  color: 'grey',

  'class': 'motif',
  classOf: function(d) { return [d.type]; },
  encodeID: function(id) { return id; },
  getNTs: function(d) { return d.nts; },
  plotIfIncomplete: true,
};

var Motifs = utils.inhert(Component, 'motifs', DEFAULTS);

mixins.withIdElement.call(Motifs.prototype);
mixins.asToggable.call(Motifs.prototype);
mixins.asColorable.call(Motifs.prototype);
mixins.withNTElements.call(Motifs.prototype);
mixins.withAttrs.call(Motifs.prototype);
mixins.canValidate.call(Motifs.prototype);

module.exports = function() {
  var motifs = new Motifs();

  motifs.defaultHighlight = function(d, i) {
    var data = [];
    motifs.nucleotides(d, i)
      .datum(function(d) { data.push(d); return d; });
    motifs.plot.currentView().highlightLetters(data, true);
  };

  motifs.defaultNormalize = function() {
    motifs.plot.currentView().clearHighlightLetters();
  };

  return motifs;
};
