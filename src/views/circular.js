Rna2D.views.circular = function(plot) {

  // We use the total count in a couple places.
  var ntCount;

  // This is used to track some index values and the like
  var computed = {};

  // Used to compute the centroid of a nucleotide on the backbone.
  var ntCentroid;

  // Used to compute the positions of labels
  var labelArcs;

  // Function to generate arcs for both the nucleotides and finding centriods
  // for interactions
  var arcGenerator;

  // The center of where the arc
  var CENTER;

  var Circular = inhert(Rna2D.View, 'circular', {
    radius: function() { return plot.width() / 4; },
    width: 4,
    arcGap: 0.2,
    interactionGap: 3,
    letterClass: 'nucleotide-letter',
    center: function() {
      return { x: plot.width() / 2, y: plot.height() / 2 };
    },
    letterSize: 20,
    chainBreakSize: 0.1,
    labelGap: 3,
    labelSize: 10
  });

  var globalIndex = 0;
  Circular.prototype.preprocess = function() {
    var getNTData = plot.chains.getNTData(),
        idOf = plot.nucleotides.getID();

    $.each(plot.chains(), function(chainIndex, chain) {
      $.each(getNTData(chain), function(ntIndex, nt) {
        var id = idOf(nt);
        computed[id] = {
          globalIndex: globalIndex,
          chainIndex: chainIndex,
          ntIndex: ntIndex
        };
        globalIndex++;
      });
    });
  };

  Circular.prototype.xCoord = function() {
    return function(d, i) { return CENTER.x + ntCentroid(d, i)[0]; };
  };

  Circular.prototype.yCoord = function() {
    return function(d, i) { return CENTER.y + ntCentroid(d, i)[1]; };
  };

  // Function to draw the arcs.
  Circular.prototype.coordinates = function() {

    ntCount = plot.nucleotides.count();

    CENTER = this.center()();

    var idOf = plot.nucleotides.getID(),
        radius = this.radius()(),
        outerArcs = arcGenerator(radius - this.width(), radius),
        arcFor = function(d, i) { return outerArcs[computed[idOf(d)].chainIndex]; };

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
      .attr('transform', 'translate(' + CENTER.x + ',' + CENTER.y + ')')
      .selectAll(plot.nucleotides['class']())
      .data(plot.chains.getNTData()).enter()
      .append('svg:path')
      .attr('d', function(d, i) {
        return arcFor(d, i)(d, i);
      })
      .attr('fill', plot.nucleotides.color())
      .call(this.standardCoordinates());

    return plot;
  };

  // Function to draw all connections.
  Circular.prototype.connections = function() {

    var self = this;

    // Arc generator for finding the centroid of the nucleotides on the inner
    // circle, which has the interaction endpoints.
    var outerArcInnerRadius = this.radius()() - this.width(),
        innerArcInnerRadius = outerArcInnerRadius - this.interactionGap(),
        innerArcs = arcGenerator(innerArcInnerRadius, outerArcInnerRadius),
        arcFor = function(id) { return innerArcs[computed[id].chainIndex]; },
        startAngleOf = function(id) { return arcFor(id).startAngle()(null, computed[id].ntIndex); },
        centroidOf = function(id) { return arcFor(id).centroid(null, computed[id].ntIndex); };

    // Figure out the centroid position of the nucleotide with the given id in
    // the innerArc.
    var centriodPosition = function(ntID) {
      var centroid = centroidOf(ntID);
      return { x: CENTER.x + centroid[0], y: CENTER.y + centroid[1] };
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
      var nts = plot.interactions.getNTs()(d, i).sort(sortFunc),
          from = centriodPosition(nts[0]),
          to = centriodPosition(nts[1]),
          angleDiff = startAngleOf(nts[0]) - startAngleOf(nts[1]),
          radius = Math.abs(innerArcInnerRadius * Math.tan(angleDiff/2));

      return "M "  + from.x + " " + from.y +  // Start point
        " A " + radius + "," + radius +       // Both radi are the same for a circle
        " 0 0,0 " +                           // Rotation and arc flags are always 0
        to.x + "," + to.y;                    // End point
    };

    return plot.vis.selectAll(plot.interactions['class']())
      .data(plot.interactions.valid()).enter().append('path')
      .call(this.standardConnections())
      .attr('d', curve)
      .attr('fill', 'none')
      .attr('stroke', plot.interactions.color());
  };

  Circular.prototype.groups = function() {
    return this;
  };

  Circular.prototype.labels = function() {
    var innerLabelRadius = this.radius()() + this.labelGap();

    labelArcs = arcGenerator(innerLabelRadius,
                             innerLabelRadius + this.labelSize());

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

  Circular.prototype.update = function() {
    var self = this;
    plot.nucleotides.highlight(function(d, i) {
      var highlightColor = plot.nucleotides.highlightColor()(d, i);

      d3.select(this)
        .style('stroke', highlightColor)
        .style('fill', highlightColor);

      self.addLetter([d]);

      plot.nucleotides.interactions(d, i)
        .style('stroke', highlightColor);

      return plot.nucleotides;
    });

    plot.nucleotides.normalize(function(d, i) {
      d3.select(this)
        .style('stroke', null)
        .style('fill', null);

      self.clearLetters();

      plot.nucleotides.interactions(d, i)
        .style('stroke', null);

      return plot.nucleotides;
    });

    plot.interactions.highlight(function(d, i) {
      var highlightColor = plot.interactions.highlightColor()(d, i),
          nts = plot.interactions.nucleotides(d, i),
          ntData = [];

      d3.select(this).style('stroke', highlightColor);

      nts.style('stroke', highlightColor)
        .style('fill', highlightColor)
        .datum(function(d, i) {
          ntData.push(d);
          return d;
        });

      self.addLetter(ntData);

      return plot.interactions;
    });

    plot.interactions.normalize(function(d, i) {
      d3.select(this).style('stroke', null);
      self.clearLetters();
      plot.interactions.nucleotides(d, i)
        .style('stroke', null)
        .style('fill', null);
      return plot.interactions;
    });
  };

  Circular.prototype.addLetter = function(ntData) {
    var innerLabelRadius = this.radius()() + this.labelGap();
    labelArcs = arcGenerator(innerLabelRadius,
                             innerLabelRadius + this.labelSize());

    var labelCentroidFor = function(data) {
      var info = computed[plot.nucleotides.getID()(data)];
      return labelArcs[info.chainIndex].centroid(data, info.ntIndex);
    },
    positionOf = function(data) {
      var centriodPosition = labelCentroidFor(data);
      return {
        x: CENTER.x + centriodPosition[0],
        y: CENTER.y + centriodPosition[1]
      };
    };

    plot.vis.selectAll(this.letterClass())
      .data(ntData).enter().append('svg:text')
      .attr('id', function(d, i) { return 'letter-' + i; })
      .attr('class', this.letterClass())
      .attr('x', function(d) { return positionOf(d).x; })
      .attr('y', function(d) { return positionOf(d).y; })
      .attr('font-size', this.letterSize())
      .attr('pointer-events', 'none')
      .text(plot.nucleotides.highlightText())
      .attr('fill', plot.nucleotides.highlightColor());

    return this;
  };

  Circular.prototype.clearLetters = function() {
    plot.vis.selectAll('.' + this.letterClass()).remove();
    return this;
  };

  var view = new Circular();
  view.domain = { x: [0, plot.width()], y: [0, plot.height()] };

  arcGenerator = function(inner, outer) {
    var chainCount = plot.chains().length,
        angleSize = (2*Math.PI - view.arcGap() -
                    (chainCount - 1) * view.chainBreakSize()) / ntCount,
        offset = view.arcGap() / 2,
        getNTData = plot.chains.getNTData();

    return $.map(plot.chains(), function(chain, chainIndex) {
      var startAngle = (function(shift) {
            return function(_, i) { return i * angleSize + shift; };
          }(offset)),
          endAngle = (function(shift) {
            return function(_, i) { return (i + 1) * angleSize + shift; };
          }(offset));

      offset += (chainIndex + 1) * view.chainBreakSize() +
        angleSize * getNTData(chain).length;

      return d3.svg.arc()
        .innerRadius(inner)
        .outerRadius(outer)
        .startAngle(startAngle)
        .endAngle(endAngle);
    });
  };

  view.attach(plot);

  return view;
};

