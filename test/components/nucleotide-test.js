'use strict';

import { assert } from 'chai';
import Nucleotide from '../../src/components/nucleotides.js';

const standard = {
  id: '3V2F|1|A|A|6',
  x: 22.0,
  y: -11.3,
  sequence: 'A'
};

describe('The Nucleotides Component', function() {
  let plot;
  let nt;

  beforeEach(function() {
    plot = {};
    nt = new Nucleotide(plot);
  });

  describe('the defaults', function() {
    it('can get the sequence from a standard object', function() {
      assert.equal(nt.getSequence()(standard), 'A');
    });

    it('can get the number from the unit id of an object', function() {
      assert.equal(nt.getNumber()(standard), '6');
    });

    it('can get the x coordinate', function() {
      assert.equal(nt.getX()(standard), 22.0);
    });

    it('can get the y coordinate', function() {
      assert.equal(nt.getY()(standard), -11.3);
    });

    it('has a data accessor', function() {
      nt.data('hello');
      assert.equal(nt.data(), 'hello');
    });
  });

  describe('altering the defaults', function() {
    it('can set the sequence accessor', function() {
      nt.getSequence(() => 'bob');
      assert.equal(nt.getSequence()(standard), 'bob');
    });
  });

  describe('attributes', function() {
    it('is a function', function() {
      assert.isFunction(nt.attr);
    });

    it('has a default color', function() {
      assert.equal(nt._attrs.color, 'black');
    });

    it('can set attributes', function() {
      nt.attr('color', 'green');
      assert.equal(nt._attrs.color, 'green');
    });
  });

});
