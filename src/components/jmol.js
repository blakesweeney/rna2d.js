/** @module components/jmol */
/* globals jmolScript */
'use strict';

import { DataComponent } from '../components.js';

export default class Jmol extends DataComponent {

  constructor(plot) {
    let defaults = {
      divID: 'jmol',
      file: 'static/jmol/data/2AVY.pdb',
      showOnStartup: true,
      postSetup: Object,
      render: false,
    };
    super(plot, 'jmol', defaults);
    this._loaded = false;
  }

  draw() { return (this.showOnStartup() ? this.setup() : true); }

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
    var commands = [],
      ntSelect =  ids.map(function(d) { return d.number + ':' + d.chain; });

    ntSelect = ntSelect.join(' or ');
    commands.push('select ' + ntSelect + ';');
    commands.push('show ' + ntSelect + ';');

    return this.run(commands);
  }

  run(commands) {
    this.setup();

    if (typeof(commands) !== 'string') {
      commands = commands.join('\n');
    }

    return jmolScript(commands);
  }

  showNTGroup(name) {
    return (d, i) => {
      var type = this.plot[name],
        numberOf = self.plot.nucleotides.getNumber(),
        chainOf = self.plot.nucleotides.getChain(),
        nts = type.nucleotides(d, i),
        data = [];

      nts.datum(function(d) {
        data.push({number: numberOf(d), chain: chainOf(d)});
        return d;
      });

      return self.showNTs(data);
    };
  };

  nucleotides() {
    var self = this;
    return function(d, i) {
      var numberOf = self.plot.nucleotides.getNumber(),
        chainOf = self.plot.nucleotides.getChain();
      return self.showNTs([{number: numberOf(d, i), chain: chainOf(d, i)}]);
    };
  };

  interactions() { return this.showNTGroup('interactions'); }

  motifs() { return this.showNTGroup('motifs'); }

  brush() {
    var self = this;
    return function(data) {
      var numberOf = self.plot.nucleotides.getNumber(),
        chainOf = self.plot.nucleotides.getChain();
      return self.showNTs(data.map(function(d) {
        return {number: numberOf(d), chain: chainOf(d)};
      }));
    };
  };

}
