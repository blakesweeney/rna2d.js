/** @module components/jmolTools */
/* jshint jquery: true */
/* globals jmolScript, jmolApplet */
'use strict';

import { Component } from '../components.js';

export default class JmolTools extends Component {
  constructor(plot) {
    super(plot, 'jmolTools', new Map([
      ['divID', 'jmol'],
      ['appID', 'jmolApplet0'],
      ['tmpID', 'tempJmolToolsObj'],
      ['neighborhoodID', 'neighborhood'],
      ['numbersID', 'showNtNums'],
      ['stereoID', 'stero'],
      ['maxSize', 200],
      ['overflow', Object],
      ['windowSize', 400],
      ['windowBuild', ($div) => {
        $div
          .append('<label><input type="checkbox" id="showNtNums">' +
                  'Numbers</label>')
          .append('<input type="button" id="neighborhood" ' +
                  'value="Show neighborhood">')
          .append('<input type="button" id="stereo" value="Stereo">');
      }]

    ]));
  }

  setup() {
    let $app = $('#' + this.appID());
    let $div = $('#' + this.divID());

    // launch jmol if necessary
    if ($app.length === 0) {
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
  }

  nucleotides() {
    return (d, i) => {
      var idOf = this.plot.nucleotides.getID();
      return this.showNTs([idOf(d, i)]);
    };
  }

  interactions() {
    return (d, i) => {
      var getNTs = this.plot.interactions.getNTs();
      return this.showNTs(getNTs(d, i));
    };
  }

  motifs() {
    return (d, i) => {
      var getNTs = this.plot.motifs.getNTs();
      return this.showNTs(getNTs(d, i));
    };
  }

  brush() {
    return (nts) => {
      var idOf = this.plot.nucleotides.getID();
      return this.showNTs(nts.map(idOf));
    };
  }

  showNTs(ntIDs) {
    this.setup();

    if (!ntIDs) return false;

    if (ntIDs.length > this.maxSize()) {
      return this.overflow();
    }

    $('#' + this.tmpID()).remove();
    $('body').append(`<input type="radio" id="${this.tmpID()}" ` +
                     `data-coord="${ntIDs.join(',')}">`);
    $('#' + this.tmpID()).hide();
    $('#' + this.tmpID()).jmolTools({
      showNeighborhoodId: this.neighborhoodID(),
      showNumbersId: this.numbersID(),
      showStereoId: this.stereoID()
    }).jmolToggle();

    return this;
  }
}
