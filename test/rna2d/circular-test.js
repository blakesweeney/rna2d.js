'use strict';

var vows = require('vows'),
    useful = require('../useful'),
    assert = require('chai').assert;

var Circular = useful.load('views/circular');

vows.describe('The Circular View').addBatch({
  'Basic accssors': {
    topic: new Circular(),
    'it has a width': function(view) {
      view.width(50);
      assert.equal(view.width(), 50);
    },
    'it has an arc gap': function(view) {
      view.arcGap(13);
      assert.equal(view.arcGap(), 13);
    },
    'it has a helix gap': function(view) {
      view.helixGap(13);
      assert.equal(view.helixGap(), 13);
    },
    'it has a chain break size': function(view) {
      view.chainBreakSize(4);
      assert.equal(view.chainBreakSize(), 4);
    },
  },

  'computing the center': {
    topic: new Circular(),
    'it can act like an accessor': function(view) {
      view.center(20);
      assert.equal(view.center(), 20);
    },
    // 'it can defaults to using plot': function(view) {
    //   view.plot = plot;
    // },
  },

  'computing the radius': {
    topic: new Circular(),
    'it can act like an accessor': function(view) {
      view.radius(20);
      assert.equal(view.radius(), 20);
    },
    // 'it can defaults to using plot width': function(view) {
    //   view.plot = plot;
    // },
  }
}).export(module);
