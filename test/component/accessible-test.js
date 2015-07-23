'use strict';

import { Accessible } from '../../src/component.js';
import { assert } from 'chai';

describe('Accessible', function() {
  let obj = null;

  beforeEach(function() {
    let properties = new Map([['bob', 1], ['name', 'steve']]);
    obj = new Accessible(properties);
  });

  describe('accessors', function() {
    it('Adds attributes from the given map', function() {
      assert.property(obj, 'bob');
      assert.property(obj, 'name');
    });

    it('Has the default value', function() {
      assert.equal(1, obj.bob());
      assert.equal('steve', obj.name());
    });

    it('Can be set to the given value', function() {
      assert.equal(obj, obj.name('bob'));
      assert.equal(obj.name(), 'bob');
    });

    it('Can add an accessor dynamically', function() {
      obj.addAccessor('other', 123, Object);
      assert.equal(obj.other(), 123);
      assert.equal(obj, obj.other('a'));
      assert.equal(obj.other(), 'a');
    });
  });

  describe('Callbacks', function() {
    it('can add a callback', function(done) {
      obj.setCallback('bob', () => done());
      obj.bob('a');
    });

    it('Passes the old and new to the accessor', function(done) {
      obj.setCallback('bob', function(old, updated) {
        assert.equal(1, old);
        assert.equal('3', updated);
        done();
      });
      obj.bob('3');
    });

    it('can add a callback to a created accessor', function(done) {
      obj.addAccessor('other', 123, function(old, updated) {
        assert.equal(123, old);
        assert.equal('a', updated);
        done();
      });
      obj.other('a');
    });
  });
});
