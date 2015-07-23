'use strict';

import { assert } from 'chai';

import Circular from '../../src/views/circular.js';

describe('The Circular View', function() {
  let plot;
  let view;

  beforeEach(function() {
    plot = {};
    view = new Circular(plot);
  });

  describe('Basic accessors', function() {
    it('has a width', function() {
      view.width(50);
      assert.equal(50, view.width());
    });

    it('it has an arc gap', function() {
      view.arcGap(13);
      assert.equal(13, view.arcGap());
    });

    it('it has a helix gap', function() {
      view.helixGap(13);
      assert.equal(view.helixGap(), 13);
    });

    it('has a chain break size', function() {
      view.chainBreakSize(4);
      assert.equal(view.chainBreakSize(), 4);
    });
  });

  describe('computing the center', function() {
    it('is accessible', function() {
      view.center(20);
      assert.equal(view.center(), 20);
    });

    it('defaults to the center of the plot');
  });

  describe('computing the radius', function() {
    it('is accessible', function() {
      view.radius(20);
      assert.equal(view.radius(), 20);
    });

    it('defaults to 1/3 of the plot');
  });
});
