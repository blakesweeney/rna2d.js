Rna2D = function(config) {
  var plot = function() {

    var selection = d3.select(plot.selection()),
        frame = plot.frame();

    selection.call(function(selection) {

      // Create visualization object
      plot.vis = selection.append('svg')
        .attr('width', plot.width())
        .attr('height', plot.height());

      // Draw a frame around the plot as needed
      if (frame.add) {
        plot.vis.append('svg:rect')
          .classed(frame.class, true)
          .attr('x', 0)
          .attr('y', 0)
          .attr('width', plot.width())
          .attr('height', plot.height() - 1);
      };

      // Render the view.
      plot.render();

      return plot;
    });
  };

  Rna2D.brush(plot);

  // Configure the plot
  Rna2D.config(plot, config);

  return plot;
};

// Stores the views of the structure
Rna2D.views = {};

