Rna2D.components.frame = function(plot) {
  var Frame = Rna2D.setupComponent('frame', { add: true, 'class': 'frame' });

  Frame.prototype.draw = function() {
    return plot.vis.append('svg:rect')
      .classed(plot.frame['class'](), true)
      .attr('x', -plot.margin().left)
      .attr('y', -plot.margin().above)
      .attr('width', plot.width() + plot.margin().left + plot.margin().right)
      .attr('height', plot.height() + plot.margin().above + plot.margin().below)
      .style('pointer-events', 'none');
  };

  var frame = new Frame();
  frame.attach(plot);

  return frame;
};

