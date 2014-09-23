'use strict';

var vows = require('vows'),
    useful = require('../useful'),
    assert = require('chai').assert;

var Chain = useful.load('components/chain'),
    standard = {
      data: [{'id': 'A'}, {'id': 'B'}]
    };

vows.describe('The Chain Component').addBatch({
  'Setting the data': {
    topic: new Chain(),
    'computes a mapping object': function(chain) {
      chain.data(standard.data);
      assert.equal(chain._mapping, {'A': 0, 'B': 1});
    },

  }
}).export(module);
