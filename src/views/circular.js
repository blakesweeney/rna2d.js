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
      ['labelSize', 10]
    ]));

    this.addAccessor('center',
                     () => [this.plot.width() / 2, this.plot.height() / 2]);
    this.addAccessor('radius', () => this.plot.width() / 2.5);
  }

  buildArcGenerator(plot) {
    return (inner, outer) => {
      var chainCount = this.plot.chains.data().length;
      let angleSize = (2 * Math.PI - this.arcGap() -
                       (chainCount - 1) * this.chainBreakSize()) / this.ntCount;
      let offset = this.arcGap() / 2;
      let getNTData = plot.chains.getNTData();

      return plot.chains().map(function(chain, chainIndex) {
        let startAngle = ((shift) => {
          return (_, i) => i * angleSize + shift;
        })(offset);

        let endAngle = ((shift) => {
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
    let getNTData = this.plot.chains.getNTData();
    let idOf = this.plot.nucleotides.getID();
    let computed = {};

    this.arcGenerator = this.buildArcGenerator();
    this.domain =  { x: [0, this.plot.width()], y: [0, this.plot.height()] };

    this.plot.chains().forEach(function(chain, chainIndex) {
      getNTData(chain).forEach(function(nt, ntIndex) {
        var id = idOf(nt);
        computed[id] = {
          globalIndex: globalIndex,
          chainIndex: chainIndex,
          ntIndex: ntIndex
        };
        globalIndex++;
      });
    });

    this.computed = computed;
    this.ntCount = globalIndex;
  }

  xCoord() {
    let center = this.center()();
    return (d, i) => center.x + this.ntCentroid(d, i)[0];
  }

  yCoord() {
    let center = this.center()();
    return (d, i) => center.y + this.ntCentroid(d, i)[1];
  }

  chainData(selection) {
    var center = this.center()();
    return selection.attr('transform', `translate(${center.x},${center.y})`);
  }

  // Function to draw the arcs.
  coordinateData(selection) {

    let idOf = this.plot.nucleotides.getID();
    let radius = this.radius()();
    let computed = this.computed;
    let outerArcs = this.arcGenerator(radius - this.width(), radius);
    let arcFor = (d, i) => outerArcs[computed[idOf(d, i)].chainIndex];

    this.ntCentroid = (d, i) => arcFor(d, i).centroid(d, i);

    // Draw the arcs
    return selection
      .append('svg:path')
      .attr('d', function(d, i) { return arcFor(d, i)(d, i); })
      .attr('fill', this.plot.nucleotides.color());
  }

  connectionData(selection) {

    // Arc generator for finding the centroid of the nucleotides on the inner
    // circle, which has the interaction endpoints.
    let computed = this.computed;
    let outerArcInnerRadius = this.radius()() - this.width();
    let innerArcInnerRadius = outerArcInnerRadius - this.interactionGap();
    let innerArcs = this.arcGenerator(innerArcInnerRadius, outerArcInnerRadius);
    let arcFor = (id) => innerArcs[computed[id].chainIndex];
    let startAngleOf = (id) => arcFor(id).startAngle()(0, computed[id].ntIndex);
    let ntCount = this.ntCount;
    let centroidOf = (id) => arcFor(id).centroid(null, computed[id].ntIndex);

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
      let i1 = computed[nt1].globalIndex;
      let i2 = computed[nt2].globalIndex;
      return (Math.abs(i1 - i2) > ntCount / 2) ? (i2 - i1) : (i1 - i2);
    }

    var curve = function(d, i) {

      // The idea is to sort the nts such that we are always drawing from lower
      // to higher nts, unless we are drawing from one half to the other half,
      // in which case we flip the order. This lets us always use the sweep and
      // arc flags of 0,0. The code is kinda gross but it works.
      let nts = this.plot.interactions.getNTs()(d, i).sort(sortFunc);
      let from = centriodPosition(nts[0]);
      let to = centriodPosition(nts[1]);
      let angleDiff = startAngleOf(nts[0]) - startAngleOf(nts[1]);
      let radius = Math.abs(innerArcInnerRadius * Math.tan(angleDiff / 2));

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
    let computed = this.computed;
    let indexes = nts.map((nt) => computed[nt].ntIndex);

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
    let getNTs = this.plot.helixes.getNTs();
    let computed = this.computed;
    let innerLabelRadius = this.radius()() + this.helixGap();
    let labelArcs = this.arcGenerator(innerLabelRadius, innerLabelRadius + 5);

    let arcFor = function(data) {
      let nt = this.midpoint(getNTs(data));
      let info = computed[nt];

      // TODO: Fix above getting the correct nt and getting the centriod
      // position using nt data

      return {
        arc: labelArcs[info.chainIndex],
        nt: nt,
        index: info.ntIndex
      };
    };

    let positionOf = function(data) {
      const arc = arcFor(data, 'centroid');
      const centriodPosition = arc.arc.centroid(arc.nt, arc.index);
      const center = this.center()();

      return {
        x: center.x + centriodPosition[0],
        y: center.y + centriodPosition[1]
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
    let computed = this.computed;
    let innerLabelRadius = this.radius()() + this.highlightGap();
    let labelArcs = this.arcGenerator(innerLabelRadius,
                                      innerLabelRadius + this.labelSize());
    let positionOf = (data) => {
      let center = this.center()();
      let info = computed[this.plot.nucleotides.getID()(data)];
      let arc = labelArcs[info.chainIndex];
      let centriodPos = arc.centroid(data, info.ntIndex);

      return { x: center.x + centriodPos[0], y: center.y + centriodPos[1] };
    };

    return selection
      .attr('x', (d) => positionOf(d).x)
      .attr('y', (d) => positionOf(d).y);
  }
}
