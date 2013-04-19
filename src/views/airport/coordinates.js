Rna2D.views.airport.coordinates = function(plot) {

  // We make a chart function which draws the nucleotides in the given
  // coordinates.
  plot.coordinates = function(standard) {

    var data = plot.nucleotides(),
        width = plot.width(),
        height = plot.height();

    // Compute the scales and ranges.
    var xCoordMax = d3.max(data, function(d) { return d.x; }),
        yCoordMax = d3.max(data, function(d) { return d.y; }),
        xMax = d3.max([width, xCoordMax]),
        yMax = d3.max([height, yCoordMax]),
        xScale = d3.scale.linear()
          .domain([0, xMax])
          .range([0, width]),
        yScale = d3.scale.linear()
          .domain([0, yMax])
          .range([0, height]);

    plot.xScale(xScale);
    plot.yScale(yScale);
    plot.__xCoordMax = xCoordMax;
    plot.__yCoordMax = yCoordMax;

    // Draw all nucleotides.
    plot.g.selectAll(plot.nucleotides['class']())
      .data(data).enter().append('svg:text')
      .call(standard)
      .attr('x', function(d, i) { 
        var x = xScale(plot.nucleotides.getX()(d, i));
        d.__x = x;
        return x; 
      })
      .attr('y', function(d, i) { 
        var y = yScale(plot.nucleotides.getY()(d, i));
        d.__y = y;
        return  y;
      })
      .attr('font-size', plot.nucleotides.fontSize())
      .attr('fill', plot.nucleotides.color())
      .text(plot.nucleotides.getSequence())
      .attr('fill', plot.nucleotides.color());

    return plot;
  };

  plot.nucleotides.highlight(function() {
    var obj = this,
        highlightColor = plot.nucleotides.highlightColor();
    d3.select(obj).style('stroke', highlightColor());
    return plot.nucleotides.interactions(obj)
      .style('stroke', highlightColor());
  });

  plot.nucleotides.normalize(function() {
    var obj = this;
    d3.select(obj).style('stroke', null);
    return plot.nucleotides.interactions(obj)
      .style('stroke', null);
  });

  return Rna2D;
};

