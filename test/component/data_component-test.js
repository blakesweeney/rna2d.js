'use strict';

import { DataComponent } from '../../src/component.js';
import { assert } from 'chai';

describe('DataComponent', function() {
  let plot;
  let comp;

  beforeEach(function() {
    const attributes = new Map([['class', 'a'], ['stuff', 1]]);
    plot = {};
    comp = new DataComponent(plot, 'generic', attributes);
  });

  describe('Accessors', function() {
    it('creates accessors for the given attributes', function() {
      assert.equal('a', comp.class());
      assert.equal(1, comp.stuff());
    });

    it('adds a visible accesssor', function() {
      assert.ok(comp.visible());
    });

    it('has a data accessor', function() {
      assert.isArray(comp.data());
      assert.equal(comp, comp.data('b'));
      assert.equal('b', comp.data());
    });
  });

  describe('Component behaviors', function() {
    it('has a name', () => assert.equal('generic', comp._name));

    it('Attaches to the plot', function() {
      assert.equal(plot, comp.plot);
      assert.equal(comp, comp.plot.generic);
    });
  });
});
