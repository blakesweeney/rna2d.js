Rna2D.views.circular = function(plot) {

  // We use the total count in a couple places.
  var ntCount;

  // This is used to track some index values and the like
  var computed = {};

  // Used to compute the centroid of a nucleotide on the backbone.
  var ntCentroid;

  // Function to generate arcs for both the nucleotides and finding centriods
  // for interactions
  var arcGenerator;

  var Circular = inhert(Rna2D.View, 'circular', {
    radius: function() { return plot.width() / 2.5; },
    width: 4,
    arcGap: 0.2,
    interactionGap: 3,
    center: function() {
      return { x: plot.width() / 2, y: plot.height() / 2 };
    },
    chainBreakSize: 0.1,
    helixGap: 3,
    highlightGap: 8,
    labelSize: 10
  });

  Circular.prototype.preprocess = function() {
    var globalIndex = 0,
        getNTData = plot.chains.getNTData(),
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

    ntCount = globalIndex;
  };

  Circular.prototype.xCoord = function() {
    var center = this.center()();
    return function(d, i) { return center.x + ntCentroid(d, i)[0]; };
  };

  Circular.prototype.yCoord = function() {
    var center = this.center()();
    return function(d, i) { return center.y + ntCentroid(d, i)[1]; };
  };

  Circular.prototype.chainData = function(selection) {
    var center = view.center()(),
        translate = 'translate(' + center.x + ',' + center.y + ')';
    return selection.attr('transform', translate);
  };

  // Function to draw the arcs.
  Circular.prototype.coordinateData = function(selection) {

    var idOf = plot.nucleotides.getID(),
        radius = this.radius()(),
        outerArcs = arcGenerator(radius - this.width(), radius),
        arcFor = function(d, i) { return outerArcs[computed[idOf(d)].chainIndex]; };

    ntCentroid = function(d, i) {
      return arcFor(d, i).centroid(d, i);
    };

    // Draw the arcs
    return selection
      .append('svg:path')
      .attr('d', function(d, i) { return arcFor(d, i)(d, i); })
      .attr('fill', plot.nucleotides.color());
  };

  Circular.prototype.connectionData = function(selection) {

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
      var center = view.center()(),
          centroid = centroidOf(ntID);
      return { x: center.x + centroid[0], y: center.y + centroid[1] };
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

    return selection
      .append('path')
      .attr('d', curve)
      .attr('fill', 'none')
      .attr('stroke', plot.interactions.color());
  };

  Circular.prototype.groups = function() {
    return this;
  };

  Circular.prototype.helixData = function(selection) {
    var getLabelID = plot.helixes.getID(),
        getNTs = plot.helixes.getNTs(),
        innerLabelRadius = view.radius()() + view.helixGap(),
        labelArcs = arcGenerator(innerLabelRadius, innerLabelRadius + 5),
        arcFor = function(data) {
          var nt = getNTs(data)[0],
              info = computed[nt];
              // TODO: Fix above getting the correct nt and getting the centriod
              // position using nt data

              return {
                'arc': labelArcs[info.chainIndex],
                'nt': nt,
                'index': info.ntIndex
              };
        },
        positionOf = function(data) {
          var arc = arcFor(data, 'centroid'),
              centriodPosition = arc.arc.centroid(arc.nt, arc.index),
              center = view.center()();

          return {
            x: center.x + centriodPosition[0],
            y: center.y + centriodPosition[1]
          };
        };

    return selection
      .attr('transform', function(d, i) {
        var arc = arcFor(d),
            angle = arc.arc.startAngle()(arc.nt, arc.index);
        return 'rotate(' + angle + ')';
      })
      .attr('x', function(d, i) { return positionOf(d, i).x; })
      .attr('y', function(d, i) { return positionOf(d, i).y; });
  };

  Circular.prototype.ticksData = function(selection) {
    //var innerLabelRadius = this.radius()() + this.labelGap();

    //labelArcs = arcGenerator(innerLabelRadius,
                             //innerLabelRadius + this.labelSize());

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

  Circular.prototype.highlightLetterData = function(selection) {
    var innerLabelRadius = view.radius()() + view.highlightGap(),
        labelArcs = arcGenerator(innerLabelRadius,
                                 innerLabelRadius + view.labelSize()),
        positionOf = function(data) {
          var center = view.center()(),
              info = computed[plot.nucleotides.getID()(data)],
              centriodPosition = labelArcs[info.chainIndex].centroid(data, info.ntIndex);
          return {
            x: center.x + centriodPosition[0],
            y: center.y + centriodPosition[1]
          };
        };

    return selection
      .attr('x', function(d) { return positionOf(d).x; })
      .attr('y', function(d) { return positionOf(d).y; });
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

