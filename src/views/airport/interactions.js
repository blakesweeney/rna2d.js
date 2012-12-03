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

  var chart = function() {

      // Compute the data to use for interactions
      var interactions = [],
          raw = plot.interactions(),
          visible = plot.interactions.visible();

      for(var i = 0; i < raw.length; i++) {
        var obj = raw[i],
            nt1 = Rna2D.utils.element(obj.nt1),
            nt2 = Rna2D.utils.element(obj.nt2);

        if (nt1 && nt2) {

          var p1 = intersectPoint(nt1, nt2, plot.nucleotides.gap()),
              p2 = intersectPoint(nt2, nt1, plot.nucleotides.gap());

          interactions.push({
            visibility: visible(obj),
            family: obj.family,
            id: obj.nt1 + ',' + obj.nt2 + ',' + obj.family,
            nt1: obj.nt1,
            nt2: obj.nt2,
            x1: p1.x,
            y1: p1.y,
            x2: p2.x,
            y2: p2.y
          });

        } else {
          if (plot.interactions.logMissing()) {
            console.log("Could not find both nts in ", obj);
          }
        };
      }

      // Draw the interactions
      plot.vis.selectAll(plot.interactions.class())
        .data(interactions)
        .enter().append('svg:line')
        .attr('id', function(d) { return d.id; })
        .attr('class', function(d) { d.family; })
        .classed(plot.interactions.class(), true)
        .attr('x1', function(d) { return d.x1; })
        .attr('y1', function(d) { return d.y1; })
        .attr('x2', function(d) { return d.x2; })
        .attr('y2', function(d) { return d.y2; })
        .attr('visibility', function(d) { return (d.visibility ? 'visible' : 'hidden'); })
        .attr('data-nts', function(d) { return d.nt1 + ',' + d.nt2; })
        .attr('nt1', function(d, i) { return d.nt1; })
        .attr('nt2', function(d, i) { return d.nt2; })
        .on('click', plot.interactions.click())
        .on('mouseover', plot.interactions.mouseover())
        .on('mouseout', plot.interactions.mouseout());

    return plot;
  };

  // Set the rendering function
  plot.connections = chart;

  // --------------------------------------------------------------------------
  // The general actions for an interaction
  // --------------------------------------------------------------------------
  plot.interactions.all = function(family) {
    if (!arguments.length || !family) family = plot.interactions.class();
    return plot.vis.selectAll('.' + family);
  };

  plot.interactions.family = function(obj) {
    return obj.getAttribute('id').split(',')[2];
  };

  plot.interactions.nucleotides = function(obj) {
    // TODO: Can this be done with getElementById? Will it be faster?
    var nts = [obj.getAttribute('nt1'), obj.getAttribute('nt2')];
    var selector = '#' + nts.join(', #');
    return d3.selectAll(selector);
  };

  plot.interactions.show =  function(family) {
    return plot.interactions.all(family).attr('visibility', function(data) {
      data.visibility = true;
      return 'visible';
    });
  };

  plot.interactions.hide = function(family) {
    return plot.interactions.all(family).attr('visibility', function(data) {
      data.visibility = false;
      return 'hidden';
    });
  };

  plot.interactions.toggle = function(family) {
    return plot.interactions.all(family).attr('visibility', function(data) {
      if (data.visibility) {
        data.visibility = false;
        return 'hidden';
      }
      data.visibility = true;
      return 'visible';
    });
  };

  plot.interactions.highlight = function() {
    var obj = this;
    d3.select(obj).style('stroke', plot.interactions.highlightColor());
    return plot.interactions.nucleotides(obj).style('stroke', plot.interactions.highlightColor())
  };

  plot.interactions.normalize = function() {
    obj = this;
    d3.select(obj).style('stroke', null);
    return plot.interactions.nucleotides(obj).style('stroke', null);
  };

  return Rna2D;
};

