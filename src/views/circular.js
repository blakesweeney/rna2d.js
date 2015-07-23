/** @module views/circular */
'use strict';

import View from '../view.js';
import d3 from 'd3';

export default class Circular extends View {

  /**
   * Create a new Circular View.
   *
   * @constructor
   * @this {Circular}
   */
  constructor(plot) {
    super(plot, 'circular', new Map([
      ['width', 4],
      ['arcGap', 0.2],
      ['interactionGap', 3],
      ['chainBreakSize', 0.1],
      ['helixGap', 3],
      ['highlightGap', 8],
      ['labelSize', 10],
    ]));

    this.addAccessor('center',
                     () => [this.plot.width() / 2, this.plot.height() / 2]);
    this.addAccessor('radius', () => this.plot.width() / 2.5);
    this.arcGenerator = Object;
    this.domain = {};
  }

  buildArcGenerator(plot) {
    return (inner, outer) => {
      var chainCount = this.plot.chains.data().length;
      const angleSize = (2 * Math.PI - this.arcGap() -
                       (chainCount - 1) * this.chainBreakSize()) / this.ntCount;
      let offset = this.arcGap() / 2;
      const getNTData = plot.chains.getNTData();

      return plot.chains.data().map(function(chain, chainIndex) {
        const startAngle = ((shift) => {
          return (_, i) => i * angleSize + shift;
        })(offset);

        const endAngle = ((shift) => {
          return (_, i) => (i + 1) * angleSize + shift;
        })(offset);

        offset += (chainIndex + 1) * this.chainBreakSize() +
          angleSize * getNTData(chain).length;

        return d3.svg.arc()
          .innerRadius(inner)
          .outerRadius(outer)
          .startAngle(startAngle)
          .endAngle(endAngle);
      });
    };
  }

  /**
   * Executes a preprocessing step where we determine indices that will be
   * generally useful.
   *
   * @this {Circular}
   */
  preprocess() {
    let globalIndex = 0;
    const getNTData = this.plot.chains.getNTData();
    const idOf = this.plot.nucleotides.getID();
    const computed = {};

    this.arcGenerator = this.buildArcGenerator(this.plot);
    this.domain =  { x: [0, this.plot.width()], y: [0, this.plot.height()] };

    this.plot.chains.data().forEach(function(chain, chainIndex) {
      getNTData(chain).forEach(function(nt, ntIndex) {
        var id = idOf(nt);
        computed[id] = {
          globalIndex: globalIndex,
          chainIndex: chainIndex,
          ntIndex: ntIndex,
        };
        globalIndex++;
      });
    });

    this.computed = computed;
    this.ntCount = globalIndex;
  }

  xCoord() {
    const center = this.center()();
    return (d, i) => center.x + this.ntCentroid(d, i)[0];
  }

  yCoord() {
    const center = this.center()();
    return (d, i) => center.y + this.ntCentroid(d, i)[1];
  }

  chainData(selection) {
    const center = this.center()();
    return selection.attr('transform', `translate(${center.x},${center.y})`);
  }

  // Function to draw the arcs.
  coordinateData(selection) {
    const idOf = this.plot.nucleotides.getID();
    const radius = this.radius()();
    const computed = this.computed;
    const outerArcs = this.arcGenerator(radius - this.width(), radius);
    const arcFor = (d, i) => outerArcs[computed[idOf(d, i)].chainIndex];

    this.ntCentroid = (d, i) => arcFor(d, i).centroid(d, i);

    // Draw the arcs
    return selection
      .append('svg:path')
      .attr('d', (d, i) => arcFor(d, i)(d, i))
      .attr('fill', this.plot.nucleotides.color());
  }

  connectionData(selection) {
    // Arc generator for finding the centroid of the nucleotides on the inner
    // circle, which has the interaction endpoints.
    const computed = this.computed;
    const outerArcInnerRadius = this.radius()() - this.width();
    const innerArcInnerRadius = outerArcInnerRadius - this.interactionGap();
    const innerArcs = this.arcGenerator(innerArcInnerRadius, outerArcInnerRadius);
    const arcFor = (id) => innerArcs[computed[id].chainIndex];
    const startAngleOf = (id) => arcFor(id).startAngle()(0, computed[id].ntIndex);
    const ntCount = this.ntCount;
    const centroidOf = (id) => arcFor(id).centroid(null, computed[id].ntIndex);

    // Figure out the centroid position of the nucleotide with the given id in
    // the innerArc.
    var centriodPosition = (ntID) => {
      const center = this.center()();
      const centroid = centroidOf(ntID);
      return { x: center.x + centroid[0], y: center.y + centroid[1] };
    };

    // A function to sort nucleotide ids based upon their index amoung all
    // nucleotides. This is used to draw arcs correctly.
    function sortFunc(nt1, nt2) {
      const i1 = computed[nt1].globalIndex;
      const i2 = computed[nt2].globalIndex;
      return (Math.abs(i1 - i2) > ntCount / 2) ? (i2 - i1) : (i1 - i2);
    }

    var curve = function(d, i) {
      // The idea is to sort the nts such that we are always drawing from lower
      // to higher nts, unless we are drawing from one half to the other half,
      // in which case we flip the order. This lets us always use the sweep and
      // arc flags of 0,0. The code is kinda gross but it works.
      const nts = this.plot.interactions.getNTs()(d, i).sort(sortFunc);
      const from = centriodPosition(nts[0]);
      const to = centriodPosition(nts[1]);
      const angleDiff = startAngleOf(nts[0]) - startAngleOf(nts[1]);
      const radius = Math.abs(innerArcInnerRadius * Math.tan(angleDiff / 2));

      // In order this defines an arc using
      // Start point
      // Both radi are the same for a circle
      // Rotation and arc flags are always 0
      // End point
      return `M ${from.x} ${from.y}` +
        `A ${radius},${radius} 0 0,0` +
        `${to.x}, ${to.y}`;
    };

    return selection
      .append('path')
      .attr('d', curve)
      .attr('fill', 'none')
      .attr('stroke', this.plot.interactions.color());
  }

  groups() {
    return this;
  }

  midpoint(nts) {
    let midpoint = null;
    let prev = null;
    const computed = this.computed;
    const indexes = nts.map((nt) => computed[nt].ntIndex);

    indexes.sort((a, b) => a - b);
    prev = indexes[0];
    indexes.forEach((index, j) => {
      if (midpoint === null && index - prev > 1) {
        midpoint = Math.floor((j - 1) / 2);
      }

      prev = index;
    });

    if (midpoint === null) {
      midpoint = Math.floor(nts.length / 2);
    }

    return nts[midpoint];
  }

  helixData(selection) {
    const getNTs = this.plot.helixes.getNTs();
    const computed = this.computed;
    const innerLabelRadius = this.radius()() + this.helixGap();
    const labelArcs = this.arcGenerator(innerLabelRadius, innerLabelRadius + 5);

    const arcFor = function(data) {
      const nt = this.midpoint(getNTs(data));
      const info = computed[nt];

      // TODO: Fix above getting the correct nt and getting the centriod
      // position using nt data

      return {
        arc: labelArcs[info.chainIndex],
        nt: nt,
        index: info.ntIndex,
      };
    };

    const positionOf = function(data) {
      const arc = arcFor(data, 'centroid');
      const centriodPosition = arc.arc.centroid(arc.nt, arc.index);
      const center = this.center()();

      return {
        x: center.x + centriodPosition[0],
        y: center.y + centriodPosition[1],
      };
    };

    return selection
      .attr('x', (d, i) => {
        const x = positionOf(d, i).x;
        const arc = arcFor(d);
        const angle = Math.PI - arc.arc.startAngle()(arc.nt, arc.index);
        const shift = this.getBBox().width * Math.sin(angle);
        return x + shift;
      })

      .attr('y', (d, i) => {
        const y = positionOf(d, i).y;
        const arc = arcFor(d);
        const angle = arc.arc.startAngle()(arc.nt, arc.index);
        const shift = this.getBBox().height * Math.cos(angle);
        return y - shift;
      });
  }

  highlightLetterData(selection) {
    const computed = this.computed;
    const innerLabelRadius = this.radius()() + this.highlightGap();
    const labelArcs = this.arcGenerator(innerLabelRadius,
                                      innerLabelRadius + this.labelSize());
    const positionOf = (data) => {
      const center = this.center()();
      const info = computed[this.plot.nucleotides.getID()(data)];
      const arc = labelArcs[info.chainIndex];
      const centriodPos = arc.centroid(data, info.ntIndex);

      return { x: center.x + centriodPos[0], y: center.y + centriodPos[1] };
    };

    return selection
      .attr('x', (d) => positionOf(d).x)
      .attr('y', (d) => positionOf(d).y);
  }
}
