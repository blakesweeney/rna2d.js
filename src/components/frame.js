Rna2D.components.frame = function(plot) {

  plot.components.frame = function() {

    // Draw a frame around the plot as needed
    if (plot.frame.add()) {
      plot.vis.append('svg:rect')
        .classed(plot.frame.class(), true)
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', plot.width())
        .attr('height', plot.height() - 1)
        .style('pointer-events', 'none');
    };
  }

  plot.frame = {};

  return Rna2D;
}

