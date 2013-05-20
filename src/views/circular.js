Rna2D.views.circular = function(plot) {

  // We use the total count in a couple places.
  var ntCount;

  // We need to track the nt -> index map.
  var indexes = {};

  // Used to compute the centroid of a nucleotide on the backbone.
  var ntCentroid;

  // Function to generate arcs for both the nucleotides and finding centriods
  // for interactions
  var arcGenerator = function(inner, outer) {
    return $.map(plot.chains(), function(chain, index) {
      var angleSize = (2*Math.PI - plot.views.circular.arcGap()) / ntCount,
          halfGap = plot.views.circular.arcGap() / 2,
          breakSize = index * plot.views.circular.chainBreakSize(),
          offset = halfGap + breakSize,
          startAngle = function(d, i) { return i * angleSize + offset; },
          endAngle = function(d, i) { return (i + 1) * angleSize + offset; };

      return d3.svg.arc()
        .innerRadius(inner)
        .outerRadius(outer)
        .startAngle(startAngle)
        .endAngle(endAngle);
    });
  };

  // Function to draw the arcs.
  var coordinates = function(standard) {

    ntCount = plot.nucleotides.count();

    var center = plot.views.circular.center()(),
        outerArcs = arcGenerator(plot.views.circular.radius()() - plot.views.circular.width(), plot.views.circular.radius()()),
        arcFor = function(d, i) { return outerArcs[plot.chains.chainOf(d, i)]; };

    ntCentroid = function(d, i) {
      return arcFor(d, i).centroid(d, i);
    };

    // Draw the arcs
    plot.vis.selectAll(plot.chains['class']())
      .append('g')
      .data(plot.chains()).enter()
        .append('g')
        .attr('id', plot.chains.getID())
        .attr('class', plot.chains['class']())
        .attr('transform', 'translate(' + center.x + ',' + center.y + ')')
        .selectAll(plot.nucleotides['class']())
        .data(plot.chains.getNTData()).enter()
          .append('svg:path')
          .attr('d', function(d, i) {
            indexes[plot.nucleotides.getID()(d, i)] = i;
            return arcFor(d, i)(d, i);
          })
          .attr('fill', plot.nucleotides.color())
          .call(standard);

    return plot;
  };

  // Function to draw all connections.
  var connections = function(standard) {

    // Arc generator for finding the centroid of the nucleotides on the inner
    // circle, which has the interaction endpoints.
    var outerArcInnerRadius = plot.views.circular.radius()() - plot.views.circular.width(),
        innerArcInnerRadius = outerArcInnerRadius - plot.views.circular.interactionGap(),
        innerArcs = arcGenerator(innerArcInnerRadius, outerArcInnerRadius),
        arcFor = function(d, i) { return innerArcs[plot.chains.chainOf(d, i)]; };

    // We use the indexes map to get the index within the chain then determine
    // the correct chain and add the length to get the total index of the
    // nucleotide.
    var indexOf = function(ntID) {
        var index = indexes[ntID],
            chainIndex = plot.chains.chainOf(ntID, index),
            chainLength = plot.chains.getNTData()(plot.chains()[chainIndex]).length;
        return chainLength + index;
    };

    // Figure out the centroid position of the nucleotide with the given id in
    // the innerArc.
    var centriodPosition = function(ntID) {
      var ntIndex = indexes[ntID],
          innerArc = arcFor(ntID, ntIndex),
          centroid = innerArc.centroid(null, ntIndex),
          c = plot.views.circular.center()();
      return { x: c.x + centroid[0], y: c.y + centroid[1] };
    };

    // A function to sort nucleotide ids based upon their index amoung all
    // nucleotides. This is used to draw arcs correctly.
    var sortFunc = function(nt1, nt2) {
      var i1 = indexOf(nt1),
          i2 = indexOf(nt2);
      return (Math.abs(i1 - i2) > ntCount/2) ? (i2 - i1) : (i1 - i2);
    };

    var curve = function(d, i) {

      // The idea is to sort the nts such that we are always drawing from lower to
      // higher nts, unless we are drawing from one half to the other half, in
      // which case we flip the order. This lets us always use the sweep and arc
      // flags of 0,0. The code is kinda gross but it works.
      var nts = plot.interactions.getNTs()(d, i).sort(sortFunc),
          from = centriodPosition(nts[0]),
          to = centriodPosition(nts[1]),
          angleDiff = arcFor(nts[0], indexes[nts[0]]).startAngle()(nts[0], indexes[nts[0]]) -
                      arcFor(nts[1], indexes[nts[1]]).startAngle()(nts[1], indexes[nts[1]]),
          radius = Math.abs(innerArcInnerRadius * Math.tan(angleDiff/2));

      return "M "  + from.x + " " + from.y +  // Start point
        " A " + radius + "," + radius +       // Both radi are the same for a circle
        " 0 0,0 " +                           // Rotation and arc flags are always 0
        to.x + "," + to.y;                    // End point
    };

    return plot.vis.selectAll(plot.interactions['class']())
      .data(plot.interactions.valid()).enter().append('path')
      .call(standard)
      .attr('d', curve)
      .attr('fill', 'none')
      .attr('stroke', plot.interactions.color());
  };

  return {

    domain: function() { return { x: [0, 1000], y: [0, 1000] }; },
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
        return ntCentroid(d, i).x;
      },
      yCoord: function(d, i) {
        return ntCentroid(d, i).y;
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
            centriodPosition = ntCentroid(null, index),
            center = plot.views.circular.center()();
        return { x: center.x + centriodPosition[0], y: center.y + centriodPosition[1] };
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
          .text(plot.nucleotides.getSequence())
          .attr('fill', highlightColor);

        return plot;
      },
      clearLetters: function() {
        return plot.vis.selectAll('.' + plot.views.circular.letterClass()).remove();
      },
      chainBreakSize: 0.01
    },

    sideffects: function() {

      plot.nucleotides.highlight(function(d, i) {
        var highlightColor = plot.nucleotides.highlightColor()(d, i);
            d3.select(this).style('stroke', highlightColor);

        plot.views.circular.addLetters()([d]);

        return plot.nucleotides.interactions(d, i)
          .style('stroke', highlightColor);
      });

      plot.nucleotides.normalize(function(d, i) {
        d3.select(this).style('stroke', null);
        plot.views.circular.clearLetters()();
        return plot.nucleotides.interactions(d, i)
          .style('stroke', null);
      });

      plot.interactions.highlight(function(d, i) {
        var highlightColor = plot.interactions.highlightColor()(d, i),
            nts = plot.interactions.nucleotides(d, i);

        d3.select(this).style('stroke', highlightColor);
        plot.views.circular.addLetters()(nts[0]); // TODO: WTF?

        return nts.style('stroke', highlightColor);
      });

      plot.interactions.normalize(function(d, i) {
        d3.select(this).style('stroke', null);
        plot.views.circular.clearLetters()();
        plot.interactions.nucleotides(this).style('stroke', null);
        return plot.interactions;
      });
    }
  };

};

