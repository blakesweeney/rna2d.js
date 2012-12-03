Rna2D.components.frame = function(plot, config) {

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

  // Frame configuration options
  (function(given) {
    var frame = given.frame || {},
        add = ('add' in frame ? frame.add : true),
        klass = frame['class'] || 'frame';

    plot.frame.add = function(_) {
      if (!arguments.length) return add;
      add = _;
      return plot;
    };

    plot.frame.class = function(_) {
      if (!arguments.length) return klass;
      klass = _;
      return plot;
    };

  })(config);

  return Rna2D;
}

