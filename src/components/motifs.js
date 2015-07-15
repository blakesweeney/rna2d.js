/** @module components/motifs */
'use strict';

import { DataComponent } from '../component.js';

export default class Motifs extends DataComponent {

  constructor(plot) {
    super(plot, 'motifs', new Map([
      ['click', Object],
      ['mouseover', Object],
      ['mouseout', Object],
      ['visible', true],
      ['getID', (d) => d.id],
      ['color', 'grey'],
      ['class', 'motif'],
      ['classOf', (d) => [d.type]],
      ['encodeID', (id) => id],
      ['getNTs', (d) => d.nts],
      ['plotIfIncomplete', true]
    ]));

    this.addAccessor('highlight', this.defaultHighlight);
    this.addAccessor('normalize', this.defaultNormalize);
  }

  ntElements() {
    const getNTs = this.getNTs();
    const encodeID = this.plot.nucleotides.encodeID();
    return (d, i) => getNTs(d, i).map(encodeID);
  }

  nucleotides(d, i) {
    const nts = this.getNTs()(d, i);
    const idOf = this.plot.nucleotides.getID();
    return this.plot.vis.selectAll('.' + this.plot.nucleotides.class())
      .filter((d, i) => nts.indexOf(idOf(d, i)) !== -1);
  }

  interactions(d, i) {
    const id = this.getID()(d, i);
    const getNTs = this.plot.interactions.getNTs();
    return this.plot.vis.selectAll('.' + this.plot.interactions.class())
      .filter((d) => getNTs(d).indexOf(id) !== -1);
  }

  defaultHighlight(d, i) {
    let data = [];
    this.nucleotides(d, i)
      .datum((d) => {
        data.push(d);
        return d;
      });

    this.plot.currentView().highlightLetters(data, true);
  }

  defaultNormalize() {
    this.plot.currentView().clearHighlightLetters();
  }

}
