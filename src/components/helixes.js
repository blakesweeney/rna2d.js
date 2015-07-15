/** @module components/motifs */
'use strict';

import { DataComponent } from '../component.js';

export default class Helixes extends DataComponent {
  constructor(plot) {
    super(plot, 'helixes', new Map([
      ['click', Object],
      ['mouseover', Object],
      ['mouseout', Object],
      ['highlight', Object],
      ['normalize', Object],
      ['getID', (d) => d.id],
      ['color', (d) => d.color || 'black'],
      ['visible', () => true],
      ['highlightColor', () => 'red'],
      ['class', 'helix-label'],
      ['classOf', () => []],
      ['getNTs', (d) => d.nts],
      ['getText', (d) => d.text],
      ['getX', (d) => d.x],
      ['getY', (d) => d.y],
      ['encodeID', (id) => id]
    ]));
  }

  colorByHelix() {
    let ntColor = this.plot.nucleotides.color();
    let getNTs = this.getNTs();
    let getNTID = this.plot.nucleotides.getID();
    let helixColor = this.color();
    let ntMap = {};

    this.data().forEach(function(helix, i) {
      getNTs(helix, i).forEach(function(nt) {
        ntMap[nt] = [helix, i];
      });
    });

    this.plot.nucleotides.color(function(d, i) {
      var data = ntMap[getNTID(d, i)];
      return (data ? helixColor.apply(this, data) : 'black');
    });

    this.colorize();
    this.plot.nucleotides
      .colorize()
      .color(ntColor);

    return this;
  }

  defaultHighlight(d, i) {
    var data = [];
    this.nucleotides(d, i)
      .datum((d) => {
        data.push(d);
        return d;
      });

    this.plot.currentView().highlightLetters(data, true);
    return this;
  }

  defaultNormalize() {
    this.plot.currentView().clearHighlightLetters();
    return this;
  }

}
