/** @module components/chain */
'use strict';

import { DataComponent } from '../component.js';

export default class Chain extends DataComponent {
  constructor(plot) {
    super(plot, 'chains', new Map([
      ['getID', (d) =>  d.id],
      ['class', 'chain'],
      ['classOf', () => []],
      ['encodeID', (id) => id],
      ['getNTData', (d) => d.nts],
      ['visible', () => true]
    ]));
    this._mapping = {};
  }

  chainOf(d, i) {
    return null;
  }
}
