Rna2D.views.circular.coordinates = function(plot) {

  // Let width of circle be config
  // Use width of chart + padding to get outer
  // Use width circle + outer to get inner
  // Divide circle up by number of nts
  // each nt get's own arc.

  plot.coordinates = function() {

    // plot.nucleotides(plot.nucleotides().slice(1, 10));

    var margin = 2 * Math.min(plot.margin().left, plot.margin().right),
        outer = plot.width() / 2 - margin,
        inner = outer - plot.pie.width(),
        center = { x: plot.width() / 2, y: plot.height() / 2},
        count = plot.nucleotides().length,
        angleSize = (2*Math.PI - plot.pie.gapSize()) / count,
        halfGap = plot.pie.gapSize() / 2,
        startAngle = function(d, i) { return i * angleSize + halfGap; },
        endAngle = function(d, i) { return (i + 1) * angleSize + halfGap; };

    var rawNts = plot.nucleotides(),
        getID = plot.nucleotides.getID();

    plot.nucleotides.indexes = {};
    for(var i=0; i < plot.nucleotides().length; i++) {
      plot.nucleotides.indexes[getID(rawNts[i])] = i;
    };

    plot.nucleotides.indexOf = function(ntId) {
      return plot.nucleotides.indexes[ntId];
    };

    var arc = d3.svg.arc()
          .outerRadius(outer)
          .innerRadius(inner)
          .startAngle(startAngle)
          .endAngle(endAngle);

   // Use to compute where to place the arcs for interaction arcs.
   var innerArc = d3.svg.arc()
          .outerRadius(inner)
          .innerRadius(inner - 3)
          .startAngle(startAngle)
          .endAngle(endAngle);

    plot.pie.ntCoordinates = function(ntId) {
      var centroid = innerArc.centroid(null, plot.nucleotides.indexOf(ntId)),
          c = plot.__circleCenter;
      return { x: c.x + centroid[0], y: c.y + centroid[1] };
    };

    plot.vis.selectAll(plot.nucleotides.class())
      .append('g')
      .data(plot.nucleotides()).enter().append('svg:path')
      .attr('id', plot.nucleotides.getID())
      .classed(plot.nucleotides.class(), true)
      .attr('d', arc)
      .attr('transform', 'translate(' + center.x + ',' + center.y + ')')
      .attr('fill', plot.nucleotides.color())
      .on('click', plot.nucleotides.mouseover())
      .on('mouseover', plot.nucleotides.mouseover())
      .on('mouseout', plot.nucleotides.mouseout());

    plot.__startAngle = startAngle;
    plot.__endAngle = endAngle;
    plot.__innerRadius = inner;
    plot.__circleCenter = center;

    return plot;
  };

  plot.pie = {};

  (function() {
    var width = 10,
        gap = 0.2;

    plot.pie.width = function(_) {
      if (!arguments.length) return width;
      width = _;
      return plot;
    };

    plot.pie.gapSize = function(_) {
      if (!arguments.length) return gap;
      gap = _;
      return plot;
    };
  })();

  return Rna2D;
};
