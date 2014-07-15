/** @module components/chain */
'use strict';

var mixins = require('../mixins.js'),
    utils = require('../utils.js'),
    Component = require('../component.js');

var Chain = utils.inhert(Component, 'chains', {
  getID: function(d) { return d.id; },
  'class': 'chain',
  classOf: function() { return []; },
  encodeID: function(id) { return id; },
  getNTData: function(d) { return d.nts; },
  visible: function() { return true; },
});

Chain.prototype.computeMapping = function() {
  this._mapping = {};
};

mixins.withIdElement.call(Chain.prototype);
mixins.asToggable.call(Chain.prototype);
mixins.asColorable.call(Chain.prototype);
mixins.withAttrs.call(Chain.prototype);

module.exports = function() {
  var chain = new Chain();
  mixins.hasData(chain.prototype, null, chain.computeMapping);
   utils.accessor(chain, 'chainOf', function(d, i) {
     var ntsOf = chain.getNTData(),
        chainIndex = -1,
        compare = function(d, i, chain) { return ntsOf(chain)[i] === d; };

      if (typeof(d) === 'string') {
        var idOf = chain.plot.nucleotides.getID();
        compare = function(d, i, chain) {
          return idOf(ntsOf(chain)[i]) === d;
        };
      }

    chain.data().forEach(function(chain, index) {
      if (compare(d, i, chain)) {
        chainIndex = index;
      }
    });

    return chainIndex;
  });
  return chain;
};
