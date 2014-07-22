'use strict';

var vows = require('vows'),
    useful = require('../useful'),
    assert = require('chai').assert;

var Rna2D = useful.load('main');

vows.describe('The main function').addBatch({
  'Generates a plot': {
    topic: 0, // new Rna2D(),
    'has nucleotides component': function(topic) {
      // assert.isDefined(topic.nucleotides);
    }
  }
}).export(module);
