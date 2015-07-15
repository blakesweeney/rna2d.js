'use strict';

import { assert } from 'chai';
import Interactions from '../../../src/components/interactions.js';

describe('Interactions', function() {
  let plot;
  let inter;

  beforeEach(() => {
    plot = {};
    inter = new Interactions(plot);
  });

  describe('Determing things about interacitons', function() {
    it('Knows if an interaction is forward', () => {
      assert.ok(inter.isForward({family: 'cWW'}));
    });

    it('Knows if an interaction is reverse', () => {
      assert.notOk(inter.isForward({family: 'cHW'}));
    });

    it('knows if a family is symmetric', () => {
      assert.ok(inter.isSymmetric({family: 'cSS'}));
    });

    it('knows if a family is not symmetric', () => {
      assert.ok(inter.isSymmetric({family: 'cSS'}));
    });

    describe('detecting if an interaction is of a type', function() {
      let func;
      beforeEach(() => { func = inter.isA('tWS'); });

      it('can detect if the entry is of the specified type', function() {
        assert.ok(func({family: 'tWS'}));
      });

      it('can detect if something is not of the correct type', function() {
        assert.notOk(func({family: 'cWS'}));
      });

      it('uses the getFamily accessor to get the family', function() {
        inter.getFamily((d) => d.fam);
        assert.ok(func({fam: 'tWS'}));
      });

      it('does not allow near by default', function() {
        assert.notOk(func({family: 'ntWS'}));
      });

      it('does allow near if requested', function() {
        inter.allowNear(true);
        assert.ok(func({family: 'ntWS'}));
      });
    });
  });
});
