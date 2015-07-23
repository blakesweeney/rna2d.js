/** @module components/chain */
'use strict';

import { DataComponent } from '../component.js';

export default class Chains extends DataComponent {
  constructor(plot) {
    super(plot, 'chains', new Map([
      ['getID', (d) =>  d.id],
      ['class', 'chain'],
      ['classOf', () => []],
      ['encodeID', (id) => id],
      ['getNTData', (d) => d.nts],
      ['visible', () => true],
      ['click', Object],
      ['highlight', Object],
      ['normalize', Object],
    ]));
    this._mapping = {};
  }

  chainOf() {
    return null;
  }
}
