/** @module components/interactions */
'use strict';

import { DataComponent } from '../component.js';

import d3 from 'd3';

/**
 * This class represents the behavior for interactions.
 *
 * @class
 */
export default class Interactions extends DataComponent {

  constructor(plot) {
    super(plot, 'interactions', new Map([
      ['click',  Object],
      ['mouseover', null],
      ['mouseout', null],
      ['visible', () => true],
      ['highlight', Object],
      ['normalize', Object],
      ['highlightColor', () => 'red'],
      ['getID', (d) => d.id],
      ['color', 'black'],
      ['getFamily', (d) => d.family],
      ['getNTs', (d) => [d.nt1, d.nt2]],
      ['class', 'interaction'],
      ['classOf', (d) => [d.family]],
      ['encodeID', (id) => id],
      ['allowNear', false]
    ]));

    this._forward = new Set(['WW', 'WH', 'WS', 'HH', 'SH', 'SS']);
    this.addAccessor('highlight', this.defaultHiglight);
    this.addAccessor('normalize', this.defaultNormalize);
  }

  defaultNormalize() {
    return () => {
      d3.select(this).style('stroke', null);
      this.plot.currentView().clearHighlightLetters();
      return this;
    };
  }

  defaultHighlight() {
    return (d, i) => {
      let highlightColor = this.plot.interactions.highlightColor()(d, i);
      let ntData = [];

      d3.select(this).style('stroke', highlightColor);

      this.nucleotides(d, i)
      .datum(function(d) {
        ntData.push(d);
        return d;
      });

      this.plot.currentView().highlightLetters(ntData);

      return this;
    };
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

  isSymmetric(d, i) {
    let family = this.getFamily()(d, i);
    return family[1] === family[2];
  }

  isForward(d, i) {
    let family = this.getFamily()(d, i);
    return this._forward.has(family.slice(1));
  }

  isA(requested) {
    const near = 'n' + requested;
    return (d, i) => {
      var family = this.getFamily()(d, i);
      if (this.allowNear()) {
        return family === requested || family === near;
      }

      return family === requested;
    };
  }

  validator() {
    const getNts = this.getNTs();
    const isForward = this.isForward();
    const encodeID = this.encodeID();
    const bboxOf = (id) => document.getElementById(encodeID(id));

    return (d, i) => {
      const nts = getNts(d, i);
      return isForward(d, i) && nts.length === 2 &&
        bboxOf(nts[0]) !== null && bboxOf(nts[1]) !== null;
    };
  }

}
