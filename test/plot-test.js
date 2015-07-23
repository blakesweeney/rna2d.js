import d3 from 'd3';
import jsdom from 'jsdom';

import Plot from '../src/plot.js';
import { assert } from 'chai';
import Views from '../src/views';
import Nucleotides from '../src/components/nucleotides';
import Components from '../src/components';

describe('Plot', () => {
  let plot;
  beforeEach(() => {
    plot = new Plot({});
  });

  describe('Creating one', () => {
    it('can be created with defaults', () => {
      assert.equal(plot.width(), 500);
      assert.equal(1000, plot.height());
    });

    it('has an empty list of attached components', () => {
      assert.ok(Array.isArray(plot._components));
      assert.equal(0, plot._components.length);
    });

    it('has an empty d3 selection', () => {
      assert.equal(null, plot.vis);
    });

    it('has a default circular view', () => {
      assert.equal('circular', plot.view());
    });

    describe('With a configuration', () => {
      it('will use given configuration', () => {
        plot = new Plot({width: 1000});
        assert.equal(1000, plot.width());
      });
    });
  });

  describe('Registering components', () => {
    beforeEach(() => {
      plot.register(Nucleotides);
    });

    it('Can attach a component to this plot', () => {
      assert.ok(plot.nucleotides);
    });

    it('Marks the components plot as this', () => {
      assert.equal(plot, plot.nucleotides.plot);
    });

    it('is a chainable method', () => {
      assert.equal(plot, plot.register(Nucleotides));
    });

    it('Can register several components', () => {
      plot.registerAll(Components);
      assert.ok(plot.nucleotides, 'checking nts');
      assert.ok(plot.chains, 'checking chains');
      assert.ok(plot.motifs, 'checking motifs');
      assert.ok(plot.interactions, 'checking interactions');
      assert.ok(plot.brush, 'Checking brush');
      assert.ok(plot.zoom, 'checking zoom');
      assert.ok(plot.helixes, 'checking helixes');
    });

    it('can chain registering several', () => {
      assert.equal(plot, plot.registerAll(Components));
    });
  });

  describe('Registering view', () => {
    beforeEach(() => {
      plot.register(Views[0]);
    });

    it('Can attach a view to this plot', () => {
      assert.ok(plot.circular);
    });
    it('Marks the view as belonging to a plot', () => {
      assert.equal(plot, plot.circular.plot);
    });
    it('Can register several views', () => {
      plot.registerAll(Views);
      assert.ok(plot.circular);
      assert.ok(plot.airport);
    });
  });

  describe('The current view', () => {
    it('can get the view once registered', () => {
      plot.register(Views[0]);
      assert.equal('circular', plot.currentView()._name);
    });
    it('gives undefinid if no view is registered', () => {
      assert.notOk(plot.currentView());
    });
    it('gives false if view is missing', () => {
      plot.register(Views[0]);
      plot.view('bob');
      assert.notOk(plot.currentView());
    });
  });

  describe('Computing te scales', () => {
    let scales;

    beforeEach(() => {
      plot.width(100);
      plot.height(200);
      plot.margin({ left: 10, above: 10, right: 10, below: 10 });
      plot.register(Views[0]);
      plot.currentView().domain = { x: [-100, 100], y: [-200, 200] };
      scales = plot.scales();
    });

    it('sets the x scale to the width with a margin', () => {
      const scale = scales.x;
      assert.deepEqual(scale.domain(), [-100, 100]);
      assert.deepEqual(scale.range(), [0, 80]);
      assert.deepEqual(scale(0), 40);
    });

    it('sets the y scale to the height with a margin', () => {
      const scale = scales.y;
      assert.deepEqual(scale.domain(), [-200, 200]);
      assert.deepEqual(scale.range(), [0, 180]);
      assert.deepEqual(scale(0), 90);
    });
  });

  describe('plotting', () => {
    let doc;
    let svg;

    beforeEach(() => {
      doc = jsdom.jsdom('<!DOCTYPE html><body></body></html>');
      plot
        .registerAll(Views)
        .registerAll(Components)
        .selection(d3.select(doc.body));
      plot.draw();
      svg = d3.select(doc.body).select('svg');
    });

    it('can attach to the correct element', () => {
      assert.ok(svg.classed('rna2d'));
    });

    it('has the required width', () => {
      assert.equal(500, svg.attr('width'));
    });

    it('has the required height', () => {
      assert.equal(1000, svg.attr('height'));
    });

    it('sets the scales', () => {
      assert.ok(plot.xScale());
      assert.ok(plot.yScale());
    });

    it('generates the view');
  });
});
