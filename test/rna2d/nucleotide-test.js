'use strict';

var vows = require('vows'),
    useful = require('../useful'),
    assert = require('chai').assert;

var Nucleotide = useful.load('components/nucleotides'),
    standard = {
      id: '3V2F|1|A|A|6',
      x: 22.0,
      y: -11.3,
      sequence: 'A'
    };

vows.describe('The Nucleotides Component').addBatch({
  'Has defaults': {
    topic: new Nucleotide(),
    'can get the sequence from a standard object': function(nt) {
      assert.equal(nt.getSequence()(standard), 'A');
    },
    'can get the number from the unit id of an object': function(nt) {
      assert.equal(nt.getNumber()(standard), '6');
    },
    'can get the x coordinate': function(nt) {
      assert.equal(nt.getX()(standard), 22.0);
    },
    'can get the y coordinate': function(nt) {
      assert.equal(nt.getY()(standard), -11.3);
    },
    'has a data accessor': function(nt) {
      nt.data('hello');
      assert.equal(nt.data(), 'hello');
    }
  },

  'Can alter the defaults': {
    topic: new Nucleotide(),
    'can set the sequence accessor': function(nt) {
      nt.getSequence(function() { return 'bob'; });
      assert.equal(nt.getSequence()(standard), 'bob');
    }
  },

  'Has attrs': {
    topic: new Nucleotide(),
    'is a function': function(nt) {
      assert.isFunction(nt.attr);
    },
    'it has a default color': function(nt) {
      assert.equal(nt._attrs.color, 'black');
    },
    'it can set attributes': function(nt) {
      nt.attr('color', 'green');
      assert.equal(nt._attrs.color, 'green');
    }
  },

}).export(module);
