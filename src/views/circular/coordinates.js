Rna2D.views.circular.coordinates = function(plot) {

  // Let width of circle be config
  // Use width of chart + padding to get outer
  // Use width circle + outer to get inner
  // Divide circle up by number of nts
  // each nt get's own arc.

  plot.coordinates = function() {

    var outer = plot.width() / 4,
        inner = outer - plot.pie.width(),
        center = { x: plot.width() / 2, y: plot.height() / 2},
        count = plot.nucleotides().length,
        color = d3.scale.category20c(), //plot.nucleotides.color(),
        angleSize = (2*Math.PI - plot.pie.gapSize()) / count,
        startAngle = function(d, i) { return ((i - 1) * angleSize) + plot.pie.gapSize() / 2;  },
        endAngle = function(d, i) { return (i * angleSize) + plot.pie.gapSize() / 2; };

    var arc = d3.svg.arc()
          .outerRadius(outer)
          .innerRadius(inner)
          .startAngle(startAngle)
          .endAngle(endAngle);

    plot.vis.selectAll(plot.nucleotides.class())
      .append('g')
      .data(plot.nucleotides()).enter().append('svg:path')
      .attr('id', plot.nucleotides.getID())
      .classed(plot.nucleotides.class(), true)
      .attr('d', arc)
      .attr('transform', 'translate(' + center.x + ',' + center.y + ')')
      .attr('fill', function(d, i) { return color(i); })
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
