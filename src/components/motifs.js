/** @module components/motifs */
'use strict';

import { DataComponent } from '../components.js';

export default class Motifs extends DataComponent {

  constructor(plot) {
    const defaults = new Map([
      ['click', Object],
      ['mouseover', Object],
      ['mouseout', Object],
      ['visible', true],
      ['highlight', Object],
      ['normalize', Object],
      ['highlightColor', () => 'red'],
      ['getID', (d) => d.id],
      ['color', 'grey'],
      [''class'', 'motif'],
      ['classOf', (d) => [d.type]],
      ['encodeID', (id) => id],
      ['getNTs', (d) => d.nts],
      ['plotIfIncomplete', true],
      ['highlight', (d, i) => {
        var data = [];
        this.nucleotides(d, i)
            .datum((d) => { data.push(d); return d; });
        this.plot.currentView().highlightLetters(data, true);
      }],
      ['normalize', () => this.plot.currentView().clearHighlightLetters()]
    ]);

    super(plot, 'motifs', defaults);
  }

  ntElements() {
    var getNTs = this.getNTs(),
        encodeID = this.plot.nucleotides.encodeID();
    return (d, i) => getNTs(d, i).map(encodeID);
  }

  nucleotides(d, i) {
    var nts = this.getNTs()(d, i),
        idOf = this.plot.nucleotides.getID();
    return this.plot.vis.selectAll('.' + this.plot.nucleotides['class']())
      .filter((d, i) => nts.indexOf(idOf(d, i)) !== -1);
  }

  interactions(d, i) {
    var id = this.getID()(d, i),
        getNTs = this.plot.interactions.getNTs();
    return this.plot.vis.selectAll('.' + this.plot.interactions['class']())
      .filter((d) => getNTs(d).indexOf(id) !== -1);
  }

}
