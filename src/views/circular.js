/** @module views/circular */
'use strict';

var utils = require('../utils.js'),
    d3 = require('d3'),
    View = require('../view.js');

// We use the total count in a couple places.
var ntCount;

// This is used to track some index values and the like
var computed = {};

// Used to compute the centroid of a nucleotide on the backbone.
var ntCentroid;

// Function to generate arcs for both the nucleotides and finding centriods
// for interactions
var arcGenerator;

var buildArcGenerator = function(plot) {
  var self = this;
  return function(inner, outer) {
  var chainCount = plot.chains.data().length,
      angleSize = (2*Math.PI - self.arcGap() -
                  (chainCount - 1) * self.chainBreakSize()) / ntCount,
      offset = self.arcGap() / 2,
      getNTData = plot.chains.getNTData();

  return plot.chains().map(function(chain, chainIndex) {
    var startAngle = (function(shift) {
          return function(_, i) { return i * angleSize + shift; };
        }(offset)),
        endAngle = (function(shift) {
          return function(_, i) { return (i + 1) * angleSize + shift; };
        }(offset));

    offset += (chainIndex + 1) * self.chainBreakSize() +
      angleSize * getNTData(chain).length;

    return d3.svg.arc()
      .innerRadius(inner)
      .outerRadius(outer)
      .startAngle(startAngle)
      .endAngle(endAngle);
  });
};
};

/**
 * Create a new Circular View.
 *
 * @constructor
 * @this {Circular}
 */
var Circular = function() { 
  View.call(this, 'circular', {
    width: 4,
    arcGap: 0.2,
    interactionGap: 3,
    chainBreakSize: 0.1,
    helixGap: 3,
    highlightGap: 8,
    labelSize: 10
  });
};
Circular.prototype = Object.create(View);
Circular.prototype.constructor = Circular;

/**
 * Executes a preprocessing step where we determine indices that will be
 * generally useful.
 *
 * @this {Circular}
 */
Circular.prototype.preprocess = function() {
  var globalIndex = 0,
      getNTData = this.plot.chains.getNTData(),
      idOf = this.plot.nucleotides.getID();

  arcGenerator = buildArcGenerator.call(this, this.plot);
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

  ntCount = globalIndex;
};

Circular.prototype.xCoord = function() {
  var center = this.center()();
  return function(d, i) { return center.x + ntCentroid(d, i)[0]; };
};

Circular.prototype.yCoord = function() {
  var center = this.center()();
  return function(d, i) { return center.y + ntCentroid(d, i)[1]; };
};

Circular.prototype.chainData = function(selection) {
  var center = this.center()(),
      translate = 'translate(' + center.x + ',' + center.y + ')';
  return selection.attr('transform', translate);
};

// Function to draw the arcs.
Circular.prototype.coordinateData = function(selection) {

  var idOf = this.plot.nucleotides.getID(),
      radius = this.radius()(),
      outerArcs = arcGenerator(radius - this.width(), radius),
      arcFor = function(d, i) {
        return outerArcs[computed[idOf(d, i)].chainIndex];
      };

  ntCentroid = function(d, i) {
    return arcFor(d, i).centroid(d, i);
  };

  // Draw the arcs
  return selection
    .append('svg:path')
    .attr('d', function(d, i) { return arcFor(d, i)(d, i); })
    .attr('fill', this.plot.nucleotides.color());
};

Circular.prototype.connectionData = function(selection) {

  // Arc generator for finding the centroid of the nucleotides on the inner
  // circle, which has the interaction endpoints.
  var outerArcInnerRadius = this.radius()() - this.width(),
      innerArcInnerRadius = outerArcInnerRadius - this.interactionGap(),
      innerArcs = arcGenerator(innerArcInnerRadius, outerArcInnerRadius),
      arcFor = function(id) { return innerArcs[computed[id].chainIndex]; },
      startAngleOf = function(id) {
        return arcFor(id).startAngle()(null, computed[id].ntIndex);
      },
      centroidOf = function(id) {
        return arcFor(id).centroid(null, computed[id].ntIndex);
      };

  // Figure out the centroid position of the nucleotide with the given id in
  // the innerArc.
  var centriodPosition = function(ntID) {
    var center = this.center()(),
        centroid = centroidOf(ntID);
    return { x: center.x + centroid[0], y: center.y + centroid[1] };
  };

  // A function to sort nucleotide ids based upon their index amoung all
  // nucleotides. This is used to draw arcs correctly.
  var sortFunc = function(nt1, nt2) {
    var i1 = computed[nt1].globalIndex,
        i2 = computed[nt2].globalIndex;
    return (Math.abs(i1 - i2) > ntCount/2) ? (i2 - i1) : (i1 - i2);
  };

  var curve = function(d, i) {

    // The idea is to sort the nts such that we are always drawing from lower to
    // higher nts, unless we are drawing from one half to the other half, in
    // which case we flip the order. This lets us always use the sweep and arc
    // flags of 0,0. The code is kinda gross but it works.
    var nts = this.plot.interactions.getNTs()(d, i).sort(sortFunc),
        from = centriodPosition(nts[0]),
        to = centriodPosition(nts[1]),
        angleDiff = startAngleOf(nts[0]) - startAngleOf(nts[1]),
        radius = Math.abs(innerArcInnerRadius * Math.tan(angleDiff/2));

    // Start point
    return 'M '  + from.x + ' ' + from.y +
      // Both radi are the same for a circle
      ' A ' + radius + ',' + radius +
      // Rotation and arc flags are always 0
      ' 0 0,0 ' +
      // End point
      to.x + ',' + to.y;
  };

  return selection
    .append('path')
    .attr('d', curve)
    .attr('fill', 'none')
    .attr('stroke', this.plot.interactions.color());
};

Circular.prototype.groups = function() {
  return this;
};

Circular.prototype.midpoint = function(nts) {
  var midpoint = null,
      prev = null,
      indexes = [];
  indexes = nts.map(function(nt) { return computed[nt].ntIndex; });
  indexes.sort(function(a, b) { return a - b; });
  prev = indexes[0];
  indexes.forEach(function(index, j) {
    if (midpoint === null && index - prev > 1) {
      midpoint = Math.floor((j - 1) / 2);
    }
    prev = index;
  });
  if (midpoint === null) {
    midpoint = Math.floor(nts.length / 2);
  }
  console.log(indexes, indexes[midpoint]);
  return nts[midpoint];
};

Circular.prototype.helixData = function(selection) {
  var getNTs = this.plot.helixes.getNTs(),
      innerLabelRadius = this.radius()() + this.helixGap(),
      labelArcs = arcGenerator(innerLabelRadius, innerLabelRadius + 5),
      arcFor = function(data) {
        var nt = this.midpoint(getNTs(data)),
            info = computed[nt];
            // TODO: Fix above getting the correct nt and getting the centriod
            // position using nt data

            return {
              'arc': labelArcs[info.chainIndex],
              'nt': nt,
              'index': info.ntIndex
            };
      },
      positionOf = function(data) {
        var arc = arcFor(data, 'centroid'),
            centriodPosition = arc.arc.centroid(arc.nt, arc.index),
            center = this.center()();

        return {
          x: center.x + centriodPosition[0],
          y: center.y + centriodPosition[1]
        };
      };

  return selection
    //.attr('text-anchor', 'middle')
    .attr('x', function(d, i) {
      var x = positionOf(d, i).x,
          arc = arcFor(d),
          angle = Math.PI - arc.arc.startAngle()(arc.nt, arc.index),
          shift = this.getBBox().width * Math.sin(angle);
      return x + shift;
    })
    .attr('y', function(d, i) {
      var y = positionOf(d, i).y,
          arc = arcFor(d),
          angle = arc.arc.startAngle()(arc.nt, arc.index),
          shift = this.getBBox().height * Math.cos(angle);
      return y - shift;
    });
};

Circular.prototype.ticksData = function() {
  //var innerLabelRadius = this.radius()() + this.labelGap();

  //labelArcs = arcGenerator(innerLabelRadius,
                           //innerLabelRadius + this.labelSize());

  //plot.vis.selectAll(plot.labels['class']())
    //.append('g')
    //.data(plot.chains()).enter()
      //.append('g')
      //.attr('id', plot.chains.getID())
      //.attr('class', plot.chains['class']())
      //.attr('transform', 'translate(' + center.x + ',' + center.y + ')')
      //.selectAll(plot.nucleotides['class']())
      //.data(plot.chains.getNTData()).enter()
        //.append('svg:path')
        //.attr('d', function(d, i) {
          //return arcFor(d, i)(d, i);
        //})
        //.attr('fill', plot.nucleotides.color())
        //.call(this.standardLabels);
};

Circular.prototype.highlightLetterData = function(selection) {
  var innerLabelRadius = this.radius()() + this.highlightGap(),
      labelArcs = arcGenerator(innerLabelRadius,
                               innerLabelRadius + this.labelSize()),
      positionOf = function(data) {
        var center = this.center()(),
            info = computed[this.plot.nucleotides.getID()(data)],
            arc = labelArcs[info.chainIndex],
            centriodPos = arc.centroid(data, info.ntIndex);
        return {
          x: center.x + centriodPos[0],
          y: center.y + centriodPos[1]
        };
      };

  return selection
    .attr('x', function(d) { return positionOf(d).x; })
    .attr('y', function(d) { return positionOf(d).y; });
};

module.exports = function() {
  var view = new Circular();
  utils.accessor(view, 'radius', function() { 
    return view.plot.width() / 2.5; 
  });
  utils.accessor(view, 'center', function() { 
    return { x: view.plot.width() / 2, y: view.plot.height() / 2 }; 
  });
  return view;
};
