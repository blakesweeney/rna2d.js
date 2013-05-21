Rna2D.components.frame = {

  config: function(plot) {
    return {
      add: true,
      'class': 'frame'
    };
  },

  generate: function(plot) {

    if (!plot.frame.add()) {
      return plot.vis;
    }

    // TODO: Change this to ignore margins.
    return plot.vis.append('svg:rect')
      .classed(plot.frame['class'](), true)
      .attr('x', -plot.margin().left)
      .attr('y', -plot.margin().above)
      .attr('width', plot.width() + plot.margin().left + plot.margin().right)
      .attr('height', plot.height() + plot.margin().above + plot.margin().below)
      .style('pointer-events', 'none');
  }
};

