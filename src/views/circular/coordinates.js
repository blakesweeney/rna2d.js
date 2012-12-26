Rna2D.views.circular.coordinates = function(plot) {

  plot.coordinates = function(standard) {

    var margin = 10 * Math.min(plot.margin().left, plot.margin().right),
        outer = plot.width() / 2 - margin,
        inner = outer - plot.pie.width(),
        center = { x: plot.width() / 2, y: plot.height() / 2},
        count = plot.nucleotides().length,
        angleSize = (2*Math.PI - plot.pie.gapSize()) / count,
        halfGap = plot.pie.gapSize() / 2,
        startAngle = function(d, i) { return i * angleSize + halfGap; },
        endAngle = function(d, i) { return (i + 1) * angleSize + halfGap; };

    var arc = d3.svg.arc()
          .outerRadius(outer)
          .innerRadius(inner)
          .startAngle(startAngle)
          .endAngle(endAngle);

    plot.vis.selectAll(plot.nucleotides['class']())
      .append('g')
      .data(plot.nucleotides()).enter().append('svg:path')
      .call(standard)
      .attr('d', arc)
      .attr('transform', 'translate(' + center.x + ',' + center.y + ')')
      .attr('fill', plot.nucleotides.color());

    plot.__ntArc = arc;
    plot.__circleCenter = center;
    // TODO: Fix scales
    plot.__xScale = d3.scale.linear()
      .domain([0, plot.width()])
      .range([-center.x, center.x + plot.width()]);
    plot.__yScale = d3.scale.linear()
      .domain([0, plot.height()])
      .range([-center.x, center.y + plot.height()]);

    return plot;
  };

  plot.nucleotides.highlight(function() {
    var obj = this,
        highlightColor = plot.nucleotides.highlightColor();
    d3.select(obj).style('stroke', highlightColor(obj));
    return plot.nucleotides.interactions(obj)
      .style('stroke', highlightColor(obj));
  });

  plot.nucleotides.normalize(function() {
    var obj = this;
    d3.select(obj).style('stroke', null);
    return plot.nucleotides.interactions(obj)
      .style('stroke', null);
  });

  plot.pie = {};
  var config = {
    width: 10,
    gapSize: 0.2
  };
  Rna2D.utils.generateAccessors(plot.pie, config);

  return Rna2D;
};

