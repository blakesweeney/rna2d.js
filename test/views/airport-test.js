import { assert } from 'chai';
import d3 from 'd3';
import jsdom from 'jsdom';

import Plot from '../../src/plot';
import Airport from '../../src/views/airport';
import Components from '../../src/components.js';

const CHAINS = [
  {nts: [
    {id: 'a', x: 0, y: -1 },
    {id: 'b', x: 10, y: 0 },
    {id: 'c', x: 0, y: 10},
    {id: 'd', x: 5, y: 5},
  ]},
];

describe('The Airport view', () => {
  let plot = {};

  beforeEach(() => {
    plot = new Plot({view: 'airport'});
    plot
      .register(Airport)
      .registerAll(Components);
  });

  describe('accesors', () => {
    it('has an accessor for plot type', () => {
      assert.isFunction(plot.airport.type);
      assert.equal('letter', plot.airport.type());
    });
  });

  describe('Preprocessing', () => {
    it('creates the domain', () => {
      plot.chains.data(CHAINS);
      plot.airport.preprocess();
      assert.deepEqual(plot.airport.domain, { x: [0, 10], y: [-1, 10] });
    });
  });

  describe('validation', () => {
    it('only accepts interactions with known nucleotides');
    it('only accepts motifs with known nucleotides');
  });

  describe('rendering', () => {
    let doc;
    // let svg;
    beforeEach(() => {
      doc = jsdom.jsdom('<!DOCTYPE html><body></body></html>');
      plot
        .selection(d3.select(doc.body))
        .chains.data(CHAINS);
    });

    describe('basic results', () => {
      beforeEach(() => {
        plot.draw();
      });

      it('Draws all nucleotides', () => {
        const nts = d3.select(doc).selectAll('.nucleotide');
        assert.equal(nts.size(), 4);
      });

      it('Draws all valid interactions');
      it('Draws all valid motifs');
      it('Draws all helixes');
    });

    describe('with options', () => {
      it('defaults to drawing letters', () => {
        plot.draw();
        const nts = d3.select(doc).selectAll('text').filter('.nucleotide');
        assert.equal(4, nts.size());
      });

      it('draws circles if requested', () => {
        plot.airport.type('circle');
        plot.draw();
        const nts = d3.select(doc).selectAll('circle').filter('.nucleotide');
        assert.equal(4, nts.size());
      });

      it('draws a line if requested');

      it('draws a circle letter if requested'); // , () => {
        // plot.airport.type('circle-letter');
        // plot.draw();
        // const circles = d3.select(doc).selectAll('circle').filter('.nucleotide');
        // const letters = d3.select(doc).selectAll('text').filter('.nucleotide');
        // assert.equal(4, circles.size());
        // assert.equal(4, letters.size());
      // });
    });
  });
});
