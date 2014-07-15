/** @module components/jmol */
/* globals jmolScript */
'use strict';

var utils = require('../utils.js'),
    Component = require('../component.js');

var Jmol = utils.inhert(Component, 'jmol', {
  divID: 'jmol',
  file: 'static/jmol/data/2AVY.pdb',
  showOnStartup: true,
  postSetup: Object,
  render: false,
});

Jmol.prototype.draw = function() {
  return (this.showOnStartup() ? this.setup() : true);
};

Jmol.prototype.setup = function() {
  if (this._loaded) {
    return true;
  }

  jmolScript('load ' + this.file() + ';');
  this._loaded = true;
  this.postSetup()();
  return true;
};

Jmol.prototype.showNTs = function(ids) {
  var commands = [],
      ntSelect =  ids.map(function(d) { return d.number + ':' + d.chain; });

  ntSelect = ntSelect.join(' or ');
  commands.push('select ' + ntSelect + ';');
  commands.push('show ' + ntSelect + ';');

  return this.run(commands);
};

Jmol.prototype.run = function(commands) {
  this.setup();

  if (typeof(commands) !== 'string') {
    commands = commands.join('\n');
  }

  return jmolScript(commands);
};

var showNTGroup = function(name) {
  var self = this;
  return function(d, i) {
    var type = self.plot[name],
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

Jmol.prototype.nucleotides = function() {
  var self = this;
  return function(d, i) {
    var numberOf = self.plot.nucleotides.getNumber(),
        chainOf = self.plot.nucleotides.getChain();
    return self.showNTs([{number: numberOf(d, i), chain: chainOf(d, i)}]);
  };
};

Jmol.prototype.interactions = function() {
  return showNTGroup.call(this, 'interactions');
};

Jmol.prototype.motifs = function() {
  return showNTGroup.call(this, 'motifs');
};

Jmol.prototype.brush = function() {
  var self = this;
  return function(data) {
    var numberOf = self.plot.nucleotides.getNumber(),
        chainOf = self.plot.nucleotides.getChain();
    return self.showNTs(data.map(function(d) {
      return {number: numberOf(d), chain: chainOf(d)};
    }));
  };
};

module.exports = function() {
  var jmol = new Jmol();
  jmol._loaded = false;
  return jmol;
};
