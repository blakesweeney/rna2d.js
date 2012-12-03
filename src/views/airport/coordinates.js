Rna2D.views.airport.coordinates = function(plot) {

  // We make a chart function which draws the nucleotides in the given
  // coordinates.
  var chart = function() {

    var data = plot.nucleotides(),
        width = plot.width(),
        height = plot.height()
        margin = plot.margin();

    // Compute the scales and ranges.
    var xCoordMax = d3.max(data, function(d) { return d.x; }),
        yCoordMax = d3.max(data, function(d) { return d.y; }),
        xMax = d3.max([width, xCoordMax]),
        yMax = d3.max([height, yCoordMax]),
        xScale = d3.scale.linear()
          .domain([-margin.right, xMax + margin.left])
          .range([0, width]),
        yScale = d3.scale.linear()
          .domain([-margin.above, yMax + margin.below])
          .range([0, height]);

    plot.__xScale = xScale;
    plot.__yScale = yScale;
    plot.__xCoordMax = xCoordMax;
    plot.__yCoordMax = yCoordMax;

    // Draw all nucleotides.
    plot.vis.selectAll(plot.nucleotides.class())
      .data(data).enter().append('svg:text')
      .attr('id', plot.nucleotides.getID())
      .classed(plot.nucleotides.class(), true)
      .attr('x', function(d, i) { return xScale(plot.nucleotides.getX()(d, i)); })
      .attr('y', function(d, i) { return yScale(plot.nucleotides.getY()(d, i)); })
      .attr('font-size', plot.nucleotides.fontSize())
      .text(plot.nucleotides.getSequence())
      .on('click', plot.nucleotides.click())
      .on('mouseover', plot.nucleotides.mouseover())
      .on('mouseout', plot.nucleotides.mouseout());

    return plot;
  };

  plot.coordinates = chart;

  // --------------------------------------------------------------------------
  // Define the common actions for a nucleotide in a plot.
  // --------------------------------------------------------------------------
  plot.nucleotides.all = function() {
    return plot.vis.selectAll('.' + plot.nucleotide.class());
  };

  plot.nucleotides.interactions = function(obj) {
    if (!arguments.length) obj = this;
    var selector = '[nt1=' + obj.getAttribute('id') + '], [nt2=' + obj.getAttribute('id') + ']';
    return plot.vis.selectAll(selector);
  };

  plot.nucleotides.highlight = function() {
    var obj = this;
    d3.select(obj).style('stroke', plot.nucleotides.highlightColor());
    return plot.nucleotides.interactions(obj).style('stroke', plot.nucleotides.highlightColor());
  };

  plot.nucleotides.normalize = function() {
    var obj = this;
    d3.select(obj).style('stroke', null);
    return plot.nucleotides.interactions(obj).style('stroke', null);
  };

  plot.nucleotides.doColor = function() {
    return plot.nucleotides.all().attr('color', plot.nucleotides.color());
  };

  return Rna2D;
};
