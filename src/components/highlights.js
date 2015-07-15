/** @module components/highlights */
'use strict';

import { DataComponent } from '../component.js';

export default class Highlights extends DataComponent {
  constructor(object) {
    super(object, 'highlighter', new Map([
    ['class', 'highlight'],
    ['classOf', (d) => [d.sequence]],
    ['color', 'red'],
    ['getID', (d) =>  'letter-' + d.id],
    ['encodeID', (id) => id],
    ['size', 20],
    ['visible', true]
    ]));

    this.addAccessor('text', this.defaultText());
  }

  defaultText() {
    return (d, i) => {
      let sequence = this.plot.nucleotides.getSequence()(d, i);
      if (this.lettersOnly()) {
        return sequence;
      }

      return sequence + this.plot.nucleotides.getNumber()(d, i);
    };
  }

  render() {
    return null;
  }

  nucleotides() {
    return null;
  }

  interactions() {
    return null;
  }
}
