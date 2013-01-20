Rna2D.components.frame = {

  config: {
    add: true,
    'class': 'frame'
  },

  generate: function(plot) {

    if (!plot.frame.add()) {
      return plot.vis;
    }

    return plot.vis.append('svg:rect')
      .classed(plot.frame['class'](), true)
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', plot.width())
      .attr('height', plot.height() - 1)
      .style('pointer-events', 'none');
  }
};

