/** @module components/interactions */
'use strict';

import { DataComponent } from '../components.js';

var mixins = require('../mixins.js'),
    d3 = require('d3'),
    Component = require('../component.js');

export default class Interactions extends DataComponent {

  constructor(plot) {
    super(plot, 'interactions', this.defaults());
    this._forward = new Set(['WW', 'WH', 'WS', 'HH', 'SH', 'SS'])
  }

  defaults() {
    let defaults = new Map([
      ['click',  Object],
      ['mouseover', null],
      ['mouseout', null],
      ['visible', () => true],
      ['highlight', Object],
      ['normalize', Object],
      ['highlightColor', (d) => 'red'; ],
      ['getID', (d) => d.id; ],
      ['color', 'black'],
      ['getFamily', (d) => d.family],
      ['getNTs', (d) => [d.nt1, d.nt2]],
      ['class', 'interaction'],
      ['classOf', (d) => [d.family]],
      ['encodeID', (id) => id],
      ['allowNear', true],
    ]);

    defaults.set('highlight', function(d, i) {
      let highlightColor = interactions.plot.interactions.highlightColor()(d, i),
        ntData = [];

      d3.select(this).style('stroke', highlightColor);

      interactions.nucleotides(d, i)
      .datum(function(d) { ntData.push(d); return d; });
      interactions.plot.currentView().highlightLetters(ntData);

      return interactions;
    });

    defaults.set('normalize', function() {
      d3.select(this).style('stroke', null);
      interactions.plot.currentView().clearHighlightLetters();
      return interactions;
    });
    return defaults;
  };

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

  isSymmetric() {
    var self = this;
    return (d, i) => {
      var family = self.getFamily()(d, i);
      return family[1] === family[2];
    };
  }

  isA(family) {
    var self = this,
      near = 'n' + family;
    return (d, i) => {
      var family = self.getFamily()(d, i);
      if (self.allowNear()) {
        return family === family || family === near;
      }
      return family === family;
    };
  }

  validator() {
    var self = this,
        getNts = self.getNTs(),
        isForward = self.isForward(),
        encodeID = self.encodeID(),
        bboxOf = (id) => document.getElementById(encodeID(id));
    return function(d, i) {
      var nts = getNts(d, i);
      return isForward(d, i) && nts.length === 2 &&
        bboxOf(nts[0]) !== null && bboxOf(nts[1]) !== null;
    };
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
}
