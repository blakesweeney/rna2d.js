'use strict';

import { DataComponent } from '../../src/component.js';
import Chain from '../../src/components/chain.js';
import { assert } from 'chai';

const standard = {
  data: [{'id': 'A'}, {'id': 'B'}],
};

describe('Chain View', function() {
  let plot;
  let chain = null;

  beforeEach(function() {
    plot = {};
    chain = new Chain(plot);
  });

  describe('General properties', function() {
    it('has a visible accessor', () => assert.isFunction(chain.visible));
    it('has a default class', () => assert.equal('chain', chain.class()));
    it('is a DataComponent', () => assert.ok(chain instanceof DataComponent));
  });

  describe('setting the data', function() {
    it('computes a mapping object', function() {
      chain.data(standard.data);
      assert.equal(chain._mapping, {'A': 0, 'B': 1});
    });
  });
});
