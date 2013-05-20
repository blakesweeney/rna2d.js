Rna2D.views.airport = function(plot) {

  // We need to track if we are drawing across the letter in which case we
  // need to use the width + radius, otherwise we just need to use the radius.
  // The bounding box is the upper left of the objects.
  var intersectPoint = function(obj1, obj2, r) {
    var bbox1 = obj1.getBBox(),
        bbox2 = obj2.getBBox(),
        x1 = bbox1.x,
        y1 = bbox1.y,
        x2 = bbox2.x,
        y2 = bbox2.y,
        dx = x2 - x1,
        dy = y2 - y1,
        almostFlat = 0.004;

    // Useful functions
    var sign = function(v) { return (v < 0 ? -1 : 1); },
        centerOf = function(bbox) { return { x: bbox.x + bbox.width/2, y: bbox.y + bbox.height/2 }; },
        dist = function(x, y) { return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)); };

    // Special case lines that are horizontal
    if (Math.abs(dy) < almostFlat) {
      y1 = y1 + bbox1.height/2;
      if (x1 < x2) {
        return { x: x1 + bbox1.width + r, y: y1 };
      }
      return { x : x1 - r, y: y1 };
    }

    // Special case lines that are vertical
    if (Math.abs(dx) < almostFlat) {
      x1 = x1 + bbox1.width/2;
      if (y1 > y2) {
        return { x: x1, y: y1 };
      }
      return { x: x1, y: y1 + bbox1.height };
    }

    // All other lines
    r = 1;
    var c = centerOf(bbox1),
        d = dist(dx, dy),
        a = sign(dx) * Math.abs(dx * r / d),
        b = sign(dy) * dist(r, a);

    return { x: c.x + a, y: c.y + b };
  };

  // We make a chart function which draws the nucleotides in the given
  // coordinates.
   var coordinates = function(standard) {

    // Draw the nucleotides
    plot.vis.selectAll(plot.chains['class']())
      .append('g')
      .data(plot.chains()).enter()
        .append('g')
        .attr('id', plot.chains.getID())
        .attr('class', plot.chains['class']())
        .selectAll(plot.nucleotides['class']())
        .data(plot.chains.getNTData()).enter()
          .append('svg:text')
          .call(standard)
          .attr('x', function(d, i) { return plot.xScale()(plot.nucleotides.getX()(d, i)); })
          .attr('y', function(d, i) { return plot.yScale()(plot.nucleotides.getY()(d, i)); })
          .attr('font-size', plot.views.airport.fontSize())
          .text(plot.nucleotides.getSequence())
          .attr('fill', plot.nucleotides.color());

    return plot;
  };

  // Function to draw the connections.
  var connections = function(standard) {

    // Compute the data to use for interactions
    var interactions = plot.interactions.valid(),
        getNTs = plot.interactions.ntElements;

    interactions = $.map(interactions, function(obj, i) {
      try {
        var nts = getNTs(obj),
            nt1 = Rna2D.utils.element(nts[0]),
            nt2 = Rna2D.utils.element(nts[1]),
            p1 = intersectPoint(nt1, nt2, plot.views.airport.gap()),
            p2 = intersectPoint(nt2, nt1, plot.views.airport.gap());
        obj.line = { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y };
      } catch (err) {
        console.log("Could not compute interaction line for", obj);
        return null;
      }

      return obj;
    });

    // Draw the interactions
    plot.vis.selectAll(plot.interactions['class']())
      .data(interactions)
      .enter()
        .append('svg:line')
        .call(standard)
        .attr('stroke', plot.interactions.color())
        .attr('x1', function(d) { return d.line.x1; })
        .attr('y1', function(d) { return d.line.y1; })
        .attr('x2', function(d) { return d.line.x2; })
        .attr('y2', function(d) { return d.line.y2; });

    return plot;
  };

  var groups = function(standard) {
      // Compute a box around the motif
      var motifs = plot.motifs(),
          i = 0,
          j = 0;

      if (!motifs || !motifs.length) {
        return plot;
      }

      $.each(motifs, function(i, current) {
        var left = 0,
            right = Number.MAX_VALUE,
            top = Number.MAX_VALUE,
            bottom = 0;

        current.missing = [];

        // Find the outer points.
        var nts = plot.motifs.ntElements(current);
        $.each(nts, function(j, id) {
          var elem = Rna2D.utils.element(id);

          if (elem === null) {
            console.log('Missing nt ' + id + ' in motif: ', current);
            current.missing.push(id);
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
        if (bottom === 0 || left === 0 || right === Number.MAX_VALUE || top === Number.MAX_VALUE) {
          console.log("Unlikely bounding box found for " + current.id);
          current.bounding = [{x: 0, y: 0}, {x: 0, y: 0}, {x: 0, y: 0}, {x: 0, y: 0}];
        } else {
          current.bounding = [
            { x: left, y: top },
            { x: left, y: bottom },
            { x: right, y: bottom },
            { x: right, y: top }
          ];
        }

      });

      var motifLine = d3.svg.line()
        .x(function(d) { return d.x; })
        .y(function(d) { return d.y; });

      // Draw the motif boxes
      plot.vis.selectAll(plot.motifs['class']())
        .data(plot.motifs()).enter().append('svg:path')
        .call(standard)
        .attr('missing-nts', function(d) { return d.missing.join(' '); })
        .attr('d', function(d) { return motifLine(d.bounding) + "Z"; });

     return plot;
  };

  return {
    domain: function() {

      // Compute the max and min of x and y coords for the scales.
      var xMax = 0,
          yMax = 0;

      $.each(plot.chains(), function(_, chain) {
        var getX = plot.nucleotides.getX(),
            getY = plot.nucleotides.getY();
        $.each(plot.chains.getNTData()(chain), function(_, nt) {
          var x = getX(nt),
              y = getY(nt);

          if (x > xMax) {
            xMax = x;
          }
          if (y > yMax) {
            yMax = y;
          }
        });
      });

      return { x: [0, xMax], y: [0, yMax] };
    },

    config: {
      fontSize: 11,
      gap: 1,
      xCoord: function(d, i) { return plot.xScale()(plot.nucleotides.getX()(d, i)); },
      yCoord: function(d, i) { return plot.yScale()(plot.nucleotides.getY()(d, i)); }
    },
    connections: connections,
    coordinates: coordinates,
    groups: groups,
    sideffects: function() {
      plot.interactions.highlight(function(d, i) {
        var highlightColor = plot.interactions.highlightColor()(d, i);
        d3.select(this).style('stroke', highlightColor);
        return plot.interactions.nucleotides(this).style('stroke', highlightColor);
      });

      plot.interactions.normalize(function() {
        d3.select(this).style('stroke', null);
        return plot.interactions.nucleotides(this).style('stroke', null);
      });

      plot.nucleotides.highlight(function(d, i) {
        var highlightColor = plot.nucleotides.highlightColor()(d, i);
        d3.select(this).style('stroke', highlightColor);
        return plot.nucleotides.interactions(d, i)
          .style('stroke', highlightColor);
      });

      plot.nucleotides.normalize(function(d, i) {
        d3.select(this).style('stroke', null);
        return plot.nucleotides.interactions(d, i)
          .style('stroke', null);
      });

      plot.motifs.highlight(function(d, i) {
        var highlightColor = plot.motifs.highlightColor();
        return plot.motifs.nucleotides(this).style('stroke', highlightColor(d, i));
      });

      plot.motifs.normalize(function(d, i) {
        return plot.motifs.nucleotides(this).style('stroke', null);
      });

    }
  };

};

