/** @module components/highlights */
'use strict';

var mixins = require('../mixins.js'),
    Component = require('../component.js');

var DEFAULTS = {
  'class': 'highlight',
  classOf: function(d) { return [d.sequence]; },
  color: function() { return 'red'; },
  getID: function(d) { return 'letter-' + d.id; },
  encodeID: function(id) { return id; },
  size: 20,
  visibility: 'visible',
  text: function(lettersOnly) {
    var plot = this.plot;
    if (lettersOnly) {
      return function(d, i) {
        return plot.nucleotides.getSequence()(d, i);
      };
    }
    return function(d, i) {
      return plot.nucleotides.getSequence()(d, i) +
        plot.nucleotides.getNumber()(d, i);
    };
  }
};

var Highlights = function() { Component.call(this, 'highlights', DEFAULTS); };
Highlights.prototype = Object.create(Component);
Highlights.prototype.constructor = Highlights;

mixins.withIdElement.call(Highlights.prototype);
mixins.asColorable.call(Highlights.prototype);
mixins.withAttrs.call(Highlights.prototype);

module.expots = Highlights;
