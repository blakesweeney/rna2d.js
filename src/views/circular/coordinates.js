Rna2D.views.circular.coordinates = function(plot) {

  // Let width of circle be config
  // Use width of chart + padding to get outer
  // Use width circle + outer to get inner
  // Divide circle up by number of nts
  // each nt get's own arc.

  plot.coordinates = function() {

    var outer = plot.width() / 4,
        count = plot.nucleotides().length,
        arc = d3.svg.arc()
          .outerRadius(outer)
          .innerRadius(outer - plot.pie.width())
          .startAngle(function(d, i) { return count * 2*Math.PI / (i - 1);  })
          .endAngle(function(d, i) { return count * 2*Math.PI / i; });

    plot.vis.selectAll(plot.nucleotides.class())
      .append('g')
      .data(plot.nucleotides()).enter().append('svg:path')
      .attr('d', arc)
      .attr('transform', 'translate(' + plot.width() / 2 + ',' + plot.height() / 2 + ')')
      .attr('id', plot.nucleotides.getID())
      .classed(plot.nucleotides.class(), true)
      .on('click', plot.nucleotides.mouseover())
      .on('mouseover', plot.nucleotides.mouseover())
      .on('mouseout', plot.nucleotides.mouseout());

    return plot;
  };

  plot.pie = {};

  (function() {
    var width = 10;

    plot.pie.width = function(_) {
      if (!arguments.length) return width;
      width = _;
      return plot;
    };
  })();

  return Rna2D;
};
