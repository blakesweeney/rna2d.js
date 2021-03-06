Rna2D.views.airport = function(plot) {

  var Airport = inhert(Rna2D.View, 'airport', { 
    fontSize: 11, 
    gap: 1, 
    highlightSize: 20
  });

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

  Airport.prototype.preprocess = function() {
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

    this.domain = { x: [0, xMax], y: [0, yMax] };
  };
  

  Airport.prototype.xCoord = function() {
    var scale = plot.xScale(),
        getX = plot.nucleotides.getX();
    return function(d, i) { return scale(getX(d, i)); };
  };

  Airport.prototype.yCoord = function() {
    var scale = plot.yScale(),
        getY = plot.nucleotides.getY();
    return function(d, i) { return scale(getY(d, i)); };
  };

  // Draw the nucleotides
  Airport.prototype.coordinates = function() {

    plot.vis.selectAll(plot.chains['class']())
      .append('g')
      .data(plot.chains()).enter()
        .append('g')
        .attr('id', plot.chains.getID())
        .attr('class', plot.chains['class']())
        .selectAll(plot.nucleotides['class']())
        .data(plot.chains.getNTData()).enter()
          .append('svg:text')
          .call(this.standardCoordinates())
          .attr('x', this.xCoord())
          .attr('y', this.yCoord())
          .attr('font-size', this.fontSize())
          .text(plot.nucleotides.getSequence())
          .attr('fill', plot.nucleotides.color());
  };

  Airport.prototype.connections = function() {

    // Compute the data to use for interactions
    var interactions = plot.interactions.valid()(),
        getNTs = plot.interactions.ntElements(),
        gap = this.gap();

    interactions = $.map(interactions, function(obj, i) {
      try {
        var nts = getNTs(obj),
            nt1 = Rna2D.utils.element(nts[0]),
            nt2 = Rna2D.utils.element(nts[1]),
            p1 = intersectPoint(nt1, nt2, gap),
            p2 = intersectPoint(nt2, nt1, gap);
        obj._line = { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y };
      } catch (err) {
        console.log("Could not compute interaction line for", obj);
        console.log(err);
        return null;
      }

      return obj;
    });

    // Draw the interactions
    plot.vis.selectAll(plot.interactions['class']())
      .data(interactions)
      .enter()
        .append('svg:line')
        .call(this.standardConnections())
        .attr('stroke', plot.interactions.color())
        .attr('x1', function(d) { return d._line.x1; })
        .attr('y1', function(d) { return d._line.y1; })
        .attr('x2', function(d) { return d._line.x2; })
        .attr('y2', function(d) { return d._line.y2; });
  };

  Airport.prototype.groups = function() {
      // Compute a box around the motif
      var motifs = plot.motifs.boundingBoxes(plot.motifs());

      if (!motifs || !motifs.length) {
        return plot;
      }

      var motifLine = d3.svg.line()
        .x(function(d) { return d.x; })
        .y(function(d) { return d.y; });

      // Draw the motif boxes
      plot.vis.selectAll(plot.motifs['class']())
        .data(plot.motifs()).enter().append('svg:path')
        .call(this.standardGroups())
        .attr('missing-nts', function(d) { return d.missing.join(' '); })
        .attr('d', function(d) { return motifLine(d.bounding) + "Z"; });

     return plot;
  };

  Airport.prototype.update = function() {

    var self = this;

    plot.interactions.highlight(function(d, i) {
      var highlightColor = plot.interactions.highlightColor()(d, i);
      d3.select(this).style('stroke', highlightColor);
      return plot.interactions.nucleotides(d, i).style('stroke', highlightColor);
    });

    // TODO: To speed up removal of highlight consider using a highlight class
    // and then removing it from all nts.

    plot.interactions.normalize(function(d, i) {
      d3.select(this).style('stroke', null);
      return plot.interactions.nucleotides(d, i).style('stroke', null);
    });

    plot.nucleotides.highlight(function(d, i) {
      var highlightColor = plot.nucleotides.highlightColor()(d, i);
      d3.select(this).style('stroke', highlightColor)
        .attr('fill', highlightColor)
        .attr('font-size', self.highlightSize())
        .text(plot.nucleotides.highlightText());
      return plot.nucleotides.interactions(d, i)
        .style('stroke', highlightColor);
    });

    plot.nucleotides.normalize(function(d, i) {
      d3.select(this).style('stroke', null)
        .attr('fill', null)
        .attr('font-size', self.fontSize())
        .text(plot.nucleotides.getSequence());
      return plot.nucleotides.interactions(d, i)
        .style('stroke', null);
    });

    plot.motifs.highlight(function(d, i) {
      var highlightColor = plot.motifs.highlightColor();
      return plot.motifs.nucleotides(d, i)
        .style('stroke', highlightColor(d, i));
    });

    plot.motifs.normalize(function(d, i) {
      return plot.motifs.nucleotides(d, i)
        .style('stroke', null);
    });
  };

  var air = new Airport();
  air.attach(plot);
  return air;
};

