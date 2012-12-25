Rna2D.views.airport.connections = function(plot) {

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
        return { x: x1, y: y1 + r };
      }
      return { x: x1, y: y1 + bbox1.height + r};
    };

    // All other lines
    r = 1;
    var c = centerOf(bbox1),
        d = dist(dx, dy),
        a = sign(dx) * Math.abs(dx * r / d),
        b = sign(dy) * dist(r, a);

    return { x: c.x + a, y: c.y + b };
  };

  plot.connections  = function(standard) {

      // Compute the data to use for interactions
      var interactions = plot.interactions.valid(),
          getNTs = plot.interactions.getNTs();

      console.log(plot.interactions().length);
      console.log(plot.interactions.valid().length);
      for(var i = 0; i < interactions.length; i++) {
        var obj = interactions[i],
            nts = getNTs(obj),
            nt1 = Rna2D.utils.element(nts[0]),
            nt2 = Rna2D.utils.element(nts[1]),
            p1 = intersectPoint(nt1, nt2, plot.nucleotides.gap()),
            p2 = intersectPoint(nt2, nt1, plot.nucleotides.gap());

        obj.line = { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y };
      }

      // Draw the interactions
      plot.vis.selectAll(plot.interactions.class())
        .data(interactions)
        .enter().append('svg:line')
        .call(standard)
        .attr('stroke', plot.interactions.color())
        .attr('x1', function(d) { return d.line.x1; })
        .attr('y1', function(d) { return d.line.y1; })
        .attr('x2', function(d) { return d.line.x2; })
        .attr('y2', function(d) { return d.line.y2; })

    return plot;
  };

  plot.interactions.highlight = function() {
    var obj = this;
    d3.select(obj).style('stroke', plot.interactions.highlightColor());
    return plot.interactions.nucleotides(obj).style('stroke', plot.interactions.highlightColor())
  };

  plot.interactions.normalize = function() {
    var obj = this;
    d3.select(obj).style('stroke', null);
    return plot.interactions.nucleotides(obj).style('stroke', null);
  };

  return Rna2D;
};

