/** @module components/jmol */
/* globals jmolScript */
'use strict';

import { DataComponent } from '../components.js';

export default class Jmol extends DataComponent {

  constructor(plot) {
    super(plot, 'jmol', new Map([
      ['divID', 'jmol'],
      ['file', 'static/jmol/data/2AVY.pdb'],
      ['showOnStartup', true],
      ['postSetup', Object],
      ['render', false]
    ]));
    this._loaded = false;
  }

  draw() {
    return (this.showOnStartup() ? this.setup() : true);
  }

  setup() {
    if (this._loaded) {
      return true;
    }

    jmolScript('load ' + this.file() + ';');
    this._loaded = true;
    this.postSetup()();
    return true;
  }

  showNTs(ids) {
    let commands = [];
    let ntSelect =  ids.map(function(d) { return d.number + ':' + d.chain; });

    ntSelect = ntSelect.join(' or ');
    commands.push('select ' + ntSelect + ';');
    commands.push('show ' + ntSelect + ';');

    return this.run(commands);
  }

  run(commands) {
    this.setup();

    if (typeof commands !== 'string') {
      commands = commands.join('\n');
    }

    return jmolScript(commands);
  }

  showNTGroup(name) {
    return (d, i) => {
      let type = this.plot[name];
      let numberOf = this.plot.nucleotides.getNumber();
      let chainOf = this.plot.nucleotides.getChain();
      let nts = type.nucleotides(d, i);
      let data = [];

      nts.datum(function(d) {
        data.push({number: numberOf(d), chain: chainOf(d)});
        return d;
      });

      return this.showNTs(data);
    };
  }

  nucleotides() {
    return (d, i) => {
      let numberOf = this.plot.nucleotides.getNumber();
      let chainOf = this.plot.nucleotides.getChain();
      return this.showNTs([{number: numberOf(d, i), chain: chainOf(d, i)}]);
    };
  }

  interactions() {
    return this.showNTGroup('interactions');
  }

  motifs() {
    return this.showNTGroup('motifs');
  }

  brush() {
    return (data) => {
      let numberOf = this.plot.nucleotides.getNumber();
      let chainOf = this.plot.nucleotides.getChain();
      return this.showNTs(data.map(function(d) {
        return {number: numberOf(d), chain: chainOf(d)};
      }));
    };
  }

}
