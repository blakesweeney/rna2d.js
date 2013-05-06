Rna2D.views.circular = function(plot) {

  // Some common config variables
  var outer, inner, center, angleSize, halfGap, startAngle, endAngle;

  // Used to compute where to place the backbone arc.
  var ntArc;

  // Use to compute where to place the arcs for interaction arcs.
  var innerArc;

  var position = function(ntId) {
    var centroid = innerArc.centroid(null, plot.nucleotides.indexOf(ntId)),
    c = plot.views.circular.center()();
    return { x: c.x + centroid[0], y: c.y + centroid[1] };
  };

  var curve = function(d, i) {
    // The idea is to sort the nts such that we are always drawing from lower to
    // higher nts, unless we are drawing from one half to the other half, in
    // which case we flip the order. This lets us always use the sweep and arc
    // flags of 0,0. The code is kinda gross but it works.
    var length = plot.nucleotides().length,
        indexOf = plot.nucleotides.indexOf,
        nts = plot.interactions.getNTs()(d).sort(function(nt1, nt2) { 
          var i1 = indexOf(nt1),
              i2 = indexOf(nt2);
          if (Math.abs(i1 - i2) > length /2) {
            return i2 - i1;
          }
          return i1 - i2; 
        });

    var from = position(nts[0]),
        to = position(nts[1]),
        angleDiff = startAngle(null, indexOf(nts[0])) - startAngle(null, indexOf(nts[1])),
        radius = Math.abs(innerArc.innerRadius()() * Math.tan(angleDiff/2));

    return "M "  + from.x + " " + from.y +  // Start point
      " A " + radius + "," + radius +       // Both radi are the same for a circle
      " 0 0,0 " +                           // Rotation and arc flags are always 0
      to.x + "," + to.y;                    // End point

  };

  // Function to draw the arcs.
  var coordinates = function(standard) {

    outer = plot.views.circular.radius()();
    inner = outer - plot.views.circular.width();
    center = plot.views.circular.center()();
    angleSize = (2*Math.PI - plot.views.circular.arcGap()) / plot.nucleotides().length;
    halfGap = plot.views.circular.arcGap() / 2;
    startAngle = function(d, i) { return i * angleSize + halfGap; };
    endAngle = function(d, i) { return (i + 1) * angleSize + halfGap; };

    ntArc = d3.svg.arc()
      .outerRadius(outer)
      .innerRadius(inner)
      .startAngle(startAngle)
      .endAngle(endAngle);

    // Define the scales we are using
    plot.xScale(d3.scale.identity().domain([0, plot.width()]))
      .yScale(d3.scale.identity().domain([0, plot.height()]));

    // Draw the arcs
    plot.vis.selectAll(plot.nucleotides['class']())
      .append('g')
      .data(plot.nucleotides()).enter().append('svg:path')
      .call(standard)
      .attr('d', ntArc)
      .attr('transform', 'translate(' + center.x + ',' + center.y + ')')
      .attr('fill', plot.nucleotides.color());

    return plot;
  };

  // Function to draw all connections.
  var connections = function(standard) {

    innerArc = d3.svg.arc()
      .outerRadius(inner)
      .innerRadius(inner - plot.views.circular.interactionGap())
      .startAngle(startAngle)
      .endAngle(endAngle);

    return plot.vis.selectAll(plot.interactions['class']())
      .data(plot.interactions.valid()).enter().append('path')
      .call(standard)
      .attr('d', curve)
      .attr('fill', 'none')
      .attr('stroke', plot.interactions.color());
  };

  return {

    xDomain: function() { return [0, 1000]; },
    yDomain: function() { return [0, 1000]; },
    coordinates: coordinates,
    connections: connections,
    groups: function(standard) { return plot; },
    config: {
      radius: function() {
        return plot.width() / 4;
      },
      width: 4,
      arcGap: 0.2,
      interactionGap: 3,
      letterClass: 'nucleotide-letter',
      xCoord: function(d, i) {
        return ntArc.centroid(null, i).x;
      },
      yCoord: function(d, i) {
        return ntArc.centroid(null, i).y;
      },
      center: function() {
        return { x: plot.width() / 2, y: plot.height() / 2 };
      },
      letterID: function(obj) {
        return obj.getAttribute('id') + '-letter';
      },
      letterSize: 20,
      letterPosition: function(obj) {
        var data = d3.select(obj).datum(),
            index = plot.nucleotides.indexOf(plot.nucleotides.getID()(data)),
            position = ntArc.centroid(null, index),
            center = plot.views.circular.center()();
        return { x: center.x + position[0], y: center.y + position[1] };
      },
      addLetters: function(nts) {
        var positionOf = plot.views.circular.letterPosition(),
            highlightColor = plot.nucleotides.highlightColor();

        plot.vis.selectAll(plot.views.circular.letterClass())
          .data(nts).enter().append('svg:text')
          .attr('id', plot.views.circular.letterID())
          .attr('class', plot.views.circular.letterClass())
          .attr('x', function(d) { return positionOf(d).x; })
          .attr('y', function(d) { return positionOf(d).y; })
          .attr('font-size', plot.views.circular.letterSize())
          .attr('pointer-events', 'none')
          .text(function(d) { return d.getAttribute('data-sequence'); })
          .attr('fill', function(d) { return highlightColor(d); });

        return plot;
      },
      clearLetters: function() {
        return plot.vis.selectAll('.' + plot.views.circular.letterClass()).remove();
      }
    },

    sideffects: function() {

      plot.nucleotides.highlight(function(d, i) {
        var obj = this,
            highlightColor = plot.nucleotides.highlightColor();
            d3.select(obj).style('stroke', highlightColor(obj));

        plot.views.circular.addLetters()([obj]);

        return plot.nucleotides.interactions(d, i)
          .style('stroke', highlightColor(obj));
      });

      plot.nucleotides.normalize(function(d, i) {
        var obj = this;
        d3.select(obj).style('stroke', null);
        plot.views.circular.clearLetters()();
        return plot.nucleotides.interactions(d, i)
          .style('stroke', null);
      });

      plot.interactions.highlight(function(d, i) {
        var obj = this,
            highlightColor = plot.interactions.highlightColor(),
            nts = plot.interactions.nucleotides(obj);

        d3.select(obj).style('stroke', highlightColor(obj));
        plot.views.circular.addLetters()(nts[0]); // TODO: WTF?

        return nts.style('stroke', highlightColor(obj));
      });

      plot.interactions.normalize(function(d, i) {
        var obj = this;
        d3.select(obj).style('stroke', null);
        plot.views.circular.clearLetters()();
        plot.interactions.nucleotides(obj).style('stroke', null);
        return plot.interactions;
      });
    }
  };

};

