Rna2D.views.airport = function(plot) {

  // Common variables.
  var xCoordMax, yCoordMax;

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

    var data = plot.nucleotides(),
        width = plot.width(),
        height = plot.height();

    // Compute the scales and ranges.
    xCoordMax = d3.max(data, function(d) { return d.x; });
    yCoordMax = d3.max(data, function(d) { return d.y; });

    var xScale = d3.scale.linear()
          .domain([0, xCoordMax])
          .range([0, width]),
        yScale = d3.scale.linear()
          .domain([0, yCoordMax])
          .range([0, height]);

    plot.xScale(xScale);
    plot.yScale(yScale);

    // Draw all nucleotides.
    plot.vis.selectAll(plot.nucleotides['class']())
      .data(data).enter().append('svg:text')
      .call(standard)
      .attr('x', function(d, i) { return xScale(plot.nucleotides.getX()(d, i)); })
      .attr('y', function(d, i) { return yScale(plot.nucleotides.getY()(d, i)); })
      .attr('font-size', plot.views.airport.fontSize())
      .text(plot.nucleotides.getSequence())
      .attr('fill', plot.nucleotides.color());

    return plot;
  };

  // Function to draw the connections.
  var connections = function(standard) {

    // Compute the data to use for interactions
    var interactions = plot.interactions.valid(),
    getNTs = plot.interactions.getNTs();

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
    .enter().append('svg:line')
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
            right = xCoordMax,
            top = yCoordMax,
            bottom = 0,
            visible = plot.motifs.visible();

        // Mark motif as visible or not
        current.visible = visible(current);
        current.missing = [];

        // Find the outer points.
        var nts = plot.motifs.getNTs()(current);
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
        // involves the outer edges. In this case we think that we have not
        // actually found the nts so we log this and use a box that cannot
        // be seen. This prevents bugs where we stop drawing boxes too early.
        if (bottom === 0 || left === 0 || right === xCoordMax || top === yCoordMax) {
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
      plot.interactions.highlight(function() {
        var obj = this,
            highlightColor = plot.interactions.highlightColor();
        d3.select(obj).style('stroke', highlightColor(obj));
        return plot.interactions.nucleotides(obj).style('stroke', highlightColor(obj));
      });

      plot.interactions.normalize(function() {
        var obj = this;
        d3.select(obj).style('stroke', null);
        return plot.interactions.nucleotides(obj).style('stroke', null);
      });

      plot.nucleotides.highlight(function() {
        var obj = this,
            highlightColor = plot.nucleotides.highlightColor();
        d3.select(obj).style('stroke', highlightColor());
        return plot.nucleotides.interactions(obj)
          .style('stroke', highlightColor());
      });

      plot.nucleotides.normalize(function() {
        var obj = this;
        d3.select(obj).style('stroke', null);
        return plot.nucleotides.interactions(obj)
          .style('stroke', null);
      });

      plot.motifs.highlight(function() {
        var obj = this,
            highlightColor = plot.motifs.highlightColor();
        return plot.motifs.nucleotides(obj).style('stroke', highlightColor(obj));
      });

      plot.motifs.normalize(function() {
        var obj = this;
        return plot.motifs.nucleotides(obj).style('stroke', null);
      });

    }
  };

};

