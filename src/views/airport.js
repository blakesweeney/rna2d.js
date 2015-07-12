/** @module views/airport */
'use strict';

import View from "../view.js";
import d3 from "d3";

/**
 * Compute the intersection point between two objects. This is used for drawing
 * lines between two nucleotides.
 */
var intersectPoint = function(obj1, obj2) {
  var centerOf = function(bbox) {
        return { x: bbox.x + bbox.width/2, y: bbox.y + bbox.height/2 };
      },
      z = 2, // TODO: Scale this with font size
      c1 = centerOf(obj1.getBBox()),
      c2 = centerOf(obj2.getBBox()),
      t = { x: c1.x - c2.x, y: c1.y - c2.y },
      d = Math.sqrt(Math.pow(t.x, 2) + Math.pow(t.y, 2));

  return {
    x1: c1.x - z * t.x / d, y1: c1.y - z * t.y / d,
    x2: c2.x + z * t.x / d, y2: c2.y + z * t.y / d
 };
};


/**
 * The class that represents the airport view.
 *
 * @class
 */
export default class Airport extends View {

  /**
   * This is a constructor fot the Airport View.
   * @constructor
   */
  constructor(plot) {
    const defaults = new Map([
      ['gap', 1],
      ['type', 'letter'],
      ['radius', 4],
    ]);
    super(plot, 'airport', defaults);
  }

  /**
   * A method to ensure we only attempt to draw valid interactions.
   */
  interactionValidator(obj) {
    var nts = this.plot.interactions.getNTs()(obj),
        encodeID = this.plot.nucleotides.encodeID(),
        nt1 = document.getElementById(encodeID(nts[0])),
        nt2 = document.getElementById(encodeID(nts[1]));

    if (!nt1 || !nt2) {
      console.log('Could not compute interaction line for', obj);
      return null;
    }

    obj.__line = intersectPoint(nt1, nt2);
    return obj;
  };

  groupsValidator(current) {
    var left = Number.MIN_VALUE,
        right = Number.MAX_VALUE,
        top = Number.MAX_VALUE,
        bottom = Number.MIN_VALUE;

    current.__missing = [];

    // Find the outer points.
    var nts = this.plot.motifs.ntElements()(current);
    nts.forEach(function(id) {
      var elem = document.getElementById(id);

      if (elem === null) {
        console.log('Missing nt ' + id + ' in motif: ', current);
        current.__missing.push(id);
      } else {
        var bbox = elem.getBBox();
        if (bbox.x < right) {
          right = bbox.x;
        }
        if (bbox.x + bbox.width > left) {
          left = bbox.x + bbox.width;
        }
        if (bbox.y + bbox.height > bottom) {
          bottom = bbox.y + bbox.height;
        }
        if (bbox.y < top) {
          top = bbox.y;
        }
      }
    });

    // Store bounding box. It is very odd to get a bounding box that
    // involves the max number value. In this case we think that we have not
    // actually found the nts so we log this and use a box that cannot be
    // seen. This prevents bugs where we stop drawing boxes too early.
    if (bottom === Number.MIN_VALUE || left === Number.MIN_VALUE ||
        right === Number.MAX_VALUE || top === Number.MAX_VALUE) {
      console.log('Unlikely bounding box found for ' + current.id);
    }

    if (current.missing && !this.plot.motifs.plotIfIncomplete()) {
      return null;
    }

    current.__bounding = [
      { x: left, y: top },
      { x: left, y: bottom },
      { x: right, y: bottom },
      { x: right, y: top }
    ];

    return current;
  };

  preprocess() {
    // Compute the max and min of x and y coords for the scales.
    var xMax = 0,
        yMax = 0,
        getNTData = this.plot.chains.getNTData(),
        getX = this.plot.nucleotides.getX(),
        getY = this.plot.nucleotides.getY();

    this.plot.chains.data().forEach(function(chain, i) {
      getNTData(chain, i).forEach(function(nt) {
        var x = getX(nt),
            y = getY(nt);

        if (x > xMax) { xMax = x; }
        if (y > yMax) { yMax = y; }
      });
    });

    this.domain = { x: [0, xMax], y: [0, yMax] };
  };

  xCoord() {
    var scale = this.plot.xScale(),
        getX = this.plot.nucleotides.getX();
    return function(d, i) { return scale(getX(d, i)); };
  };

  yCoord() {
    var scale = this.plot.yScale(),
        getY = this.plot.nucleotides.getY();
    return (d, i) => scale(getY(d, i)); ;
  };

  coordinateData(selection) {
    if (this.type() === 'letter') {
      return this.drawLetters(selection);
    }
    if (this.type() === 'circle') {
      return this.drawCircles(selection);
    }
    if (this.type() === 'line') {
      return this.drawLines(selection);
    }
    if (this.type() == 'circle-letter') {
      return this.drawCircleLetter(selection);
    }

    console.log('Unknown type of drawing.');
    return selection;
  };

  drawCircleLetter(selection) {
    selection
      .append('svg:circle')
      .attr('cx', this.xCoord())
      .attr('cy', this.yCoord())
      .attr('fill', this.plot.nucleotides.color())
      .attr('opacity', 0.7)
      .attr('r', this.radius());

    selection
      .append('svg:text')
      .attr('x', this.xCoord())
      .attr('y', this.yCoord())
      .attr('fill', 'black')
      .text(this.plot.nucleotides.getSequence());

    return selection;
  }

  drawLetters(selection) {
    return selection
      .append('svg:text')
      .attr('x', this.xCoord())
      .attr('y', this.yCoord())
      .attr('fill', this.plot.nucleotides.color())
      .text(this.plot.nucleotides.getSequence());
  };

  drawCircles(selection) {
    return selection
      .append('svg:circle')
      .attr('cx', this.xCoord())
      .attr('cy', this.yCoord())
      .attr('fill', this.plot.nucleotides.color())
      .attr('r', this.radius());
  };

  drawLines(selection) {
    var line = d3.svg.line()
      .x(this.xCoord())
      .y(this.yCoord());

    return selection
      .append('svg:path')
      .attr('d', line(selection.data()))
      .attr('fill', this.plot.nucleotides.color());
  };

  connectionData(selection) {
    return selection
      .append('svg:line')
      .attr('stroke', this.plot.interactions.color())
      .attr('x1', (d) => d.__line.x1)
      .attr('y1', (d) => d.__line.y1)
      .attr('x2', (d) => d.__line.x2)
      .attr('y2', (d) => d.__line.y2);
  };

  groupData(selection) {
      var motifLine = d3.svg.line()
        .x((d) => d.x)
        .y((d) => d.y);

      return selection
        .append('svg:path')
        .attr('d', (d) => motifLine(d.__bounding) + 'Z'; );
  };

  highlightLetterData(selection) {
    return selection
      .attr('x', (d) => d.__x; )
      .attr('y', (d) => d.__y; );
  };

  helixData(selection) {
      var xScale = this.plot.xScale(),
          yScale = this.plot.yScale(),
          getX = this.plot.helixes.getX(),
          getY = this.plot.helixes.getY();

      return selection
        .attr('x', (d, i) => xScale(getX(d, i)))
        .attr('y', (d, i) => yScale(getY(d, i)));
  };
}
