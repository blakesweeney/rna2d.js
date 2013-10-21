Rna2D.views.airport = function(plot) {

  var Airport = inhert(Rna2D.View, 'airport', {
    gap: 1
  });

  var intersectPoint = function(obj1, obj2) {
    var centerOf = function(bbox) { return { x: bbox.x + bbox.width/2, y: bbox.y + bbox.height/2 }; },
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

  Airport.prototype.interactionValidator = function(obj, i) {
    var nts = plot.interactions.getNTs()(obj),
        encodeID = plot.nucleotides.encodeID(),
        nt1 = document.getElementById(encodeID(nts[0])),
        nt2 = document.getElementById(encodeID(nts[1]));

    if (!nt1 || !nt2) {
      console.log("Could not compute interaction line for", obj);
      return null;
    }

    obj.__line = intersectPoint(nt1, nt2);
    return obj;
  };

  Airport.prototype.groupsValidator = function(current, i) {
    var left = Number.MIN_VALUE,
        right = Number.MAX_VALUE,
        top = Number.MAX_VALUE,
        bottom = Number.MIN_VALUE;

    current.__missing = [];

    // Find the outer points.
    var nts = plot.motifs.ntElements()(current);
    $.each(nts, function(j, id) {
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
      console.log("Unlikely bounding box found for " + current.id);
    }

    if (current.missing && !plot.motifs.plotIfIncomplete()) {
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

  Airport.prototype.preprocess = function() {
    // Compute the max and min of x and y coords for the scales.
    var xMax = 0,
        yMax = 0,
        getX = plot.nucleotides.getX(),
        getY = plot.nucleotides.getY();

    $.each(plot.chains(), function(_, chain) {
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
  Airport.prototype.coordinateData = function(selection) {
    return selection
      .append('svg:text')
      .attr('x', this.xCoord())
      .attr('y', this.yCoord())
      .attr('fill', plot.nucleotides.color())
      .text(plot.nucleotides.getSequence());
  };

  Airport.prototype.connectionData = function(selection) {
    return selection
      .append('svg:line')
      .attr('stroke', plot.interactions.color())
      .attr('x1', function(d) { return d.__line.x1; })
      .attr('y1', function(d) { return d.__line.y1; })
      .attr('x2', function(d) { return d.__line.x2; })
      .attr('y2', function(d) { return d.__line.y2; });
  };

  Airport.prototype.groupData = function(selection) {
      var motifLine = d3.svg.line()
        .x(function(d) { return d.x; })
        .y(function(d) { return d.y; });

      return selection
        .append('svg:path')
        .attr('d', function(d) { return motifLine(d.__bounding) + "Z"; });
  };

  Airport.prototype.highlightLetterData = function(selection) {
    return selection
      .attr('x', air.xCoord())
      .attr('y', air.yCoord());
  };

  var air = new Airport();
  air.attach(plot);
  return air;
};

