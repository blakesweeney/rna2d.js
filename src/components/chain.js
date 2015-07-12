/** @module components/chain */
'use strict';

import { DataComponent } from '../component.js';

export default class Chain extends DataComponent {
  constructor(plot) {
    const defaults = new Map([
      ['getID', (d) =>  d.id],
      ['class', 'chain'],
      ['classOf', () => []],
      ['encodeID', (id) => id],
      ['getNTData', (d) => d.nts],
      ['visible', () => true]
    ]);
    super(plot, 'chains', defaults);
    this._mapping = {};
  }
}

// mixins.withIdElement.call(Chain.prototype);
// mixins.asToggable.call(Chain.prototype);
// mixins.asColorable.call(Chain.prototype);
// mixins.withAttrs.call(Chain.prototype);
// mixins.hasData.call(Chain.prototype, null, Chain.prototype.computeMapping);

// module.exports = function() {
//   var chain = new Chain();

//   utils.accessor(chain, 'chainOf', function(d, i) {
//     var ntsOf = chain.getNTData(),
//         chainIndex = -1,
//         compare = function(d, i, chain) { return ntsOf(chain)[i] === d; };

//     if (typeof(d) === 'string') {
//       var idOf = chain.plot.nucleotides.getID();
//       compare = function(d, i, chain) { return idOf(ntsOf(chain)[i]) === d; };
//     }

//     chain.data().forEach(function(chain, index) {
//       if (compare(d, i, chain)) {
//         chainIndex = index;
//       }
//     });

//     return chainIndex;
//   });

//   return chain;
// };
