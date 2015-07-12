'use strict';

import { Component } from '../../../src/component.js';
import { assert } from 'chai';

describe('Component', function() {
  let plot = {};
  let comp = null;

  beforeEach(function() {
    comp = new Component(plot, 'generic', new Map([['bob', 1]]));
  });

  it('Creates accessors for given config', function() {
    assert.property(comp, 'bob');
    assert.isFunction(comp.bob);
    assert.equal(1, comp.bob());
    assert.equal(comp, comp.bob('a'));
    assert.equal('a', comp.bob());
  });

  it('Creates a render accessor if not given one', function() {
    assert.equal(true, comp.render());
  });

  it('Has a name', function() {
    assert.equal('generic', comp._name);
  });

  it('Attaches to the given plot', function() {
    assert.equal(plot, comp.plot);
    assert.equal(comp, comp.plot.generic);
  });

});
