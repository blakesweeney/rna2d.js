Rna2D.components.frame = {

  config: {
    add: true,
    'class': 'frame'
  },

  generate: function(plot) {

    if (!plot.frame.add()) {
      return plot.vis;
    };

    return plot.vis.append('svg:rect')
      .classed(plot.frame.class(), true)
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', plot.width())
      .attr('height', plot.height() - 1)
      .style('pointer-events', 'none');
  },
};

//Rna2D.components.frame = function(plot) {

  //plot.components.frame = function() {

    //// Draw a frame around the plot as needed
    //if (plot.frame.add()) {
      //plot.vis.append('svg:rect')
        //.classed(plot.frame.class(), true)
        //.attr('x', 0)
        //.attr('y', 0)
        //.attr('width', plot.width())
        //.attr('height', plot.height() - 1)
        //.style('pointer-events', 'none');
    //};
  //}

  //plot.frame = {};

  //// Frame configuration options
  //var config = {
    //add: true,
    //'class': 'frame'
  //};
  //Rna2D.utils.generateAccessors(plot.frame, config);

  //return Rna2D;
//}

