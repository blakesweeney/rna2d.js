/** @module components/jmolTools */
/* jshint jquery: true */
/* globals jmolScript, jmolApplet */
'use strict';

var Component = require('../component.js'),
    DEFAULTS = {
      divID: 'jmol',
      appID: 'jmolApplet0',
      tmpID: 'tempJmolToolsObj',
      neighborhoodID: 'neighborhood',
      numbersID: 'showNtNums',
      stereoID: 'stero',
      maxSize: 200,
      overflow: Object,
      windowSize: 400,
      windowBuild: function($div) {
        $div.append('<label><input type="checkbox" id="showNtNums">Numbers</label>')
        .append('<input type="button" id="neighborhood" value="Show neighborhood">')
        .append('<input type="button" id="stereo" value="Stereo">');
      },
    };

function JmolTools() { Component.call(this, 'zoom', DEFAULTS); }
JmolTools.prototype = Object.create(Component);
JmolTools.prototype.constructor = JmolTools;

JmolTools.prototype.setup = function() {
  var $app = $('#' + this.appID()),
      $div = $('#' + this.divID());

  // launch jmol if necessary
  if ($app.length === 0 ) {
    $div.html(jmolApplet(this.windowSize(), '', 0));
    this.windowBuild()($div);
    $div.show();
  }

  // reset the state of the system
  jmolScript('zap;');
  $.jmolTools.numModels = 0;
  $.jmolTools.stereo = false;
  $.jmolTools.neighborhood = false;
  $('#' + this.neighborhoodID()).val('Show neighborhood');
  $.jmolTools.models = {};

  // unbind all events
  $('#' + this.stereoID()).unbind();
  $('#' + this.neighborhoodID()).unbind();
  $('#' + this.numbersID()).unbind();

  return this;
};

JmolTools.prototype.nucleotides = function() {
  var self = this;
  return function(d, i) {
    var idOf = self.plot.nucleotides.getID();
    return self.showNTs([idOf(d, i)]);
  };
};

JmolTools.prototype.interactions = function() {
  var self = this;
  return function(d, i) {
    var getNTs = self.plot.interactions.getNTs();
    return self.showNTs(getNTs(d, i));
  };
};

JmolTools.prototype.motifs = function() {
  var self = this;
  return function(d, i) {
    var getNTs = self.plot.motifs.getNTs();
    return self.showNTs(getNTs(d, i));
  };
};

JmolTools.prototype.brush = function() {
  var self = this;
  return function(nts) {
    var idOf = self.plot.nucleotides.getID();
    return self.showNTs(nts.map(idOf));
  };
};

JmolTools.prototype.showNTs = function(ntIDs) {
  this.setup();

  if (!ntIDs) {
    return false;
  }

  if (ntIDs.length > this.maxSize()) {
    return this.overflow();
  }

  $('#' + this.tmpID()).remove();
  $('body').append('<input type="radio" id="' + this.tmpID() +
                   '" data-coord="' + ntIDs.join(',') + '">');
  $('#' + this.tmpID()).hide();
  $('#' + this.tmpID()).jmolTools({
    showNeighborhoodId: this.neighborhoodID(),
    showNumbersId: this.numbersID(),
    showStereoId: this.stereoID()
  }).jmolToggle();

  return this;
};

module.exports = JmolTools;
