Rna2D = function(config) {
  var plot = function() {

    var selection = d3.select(plot.selection());

    selection.call(function(selection) {

      // Create visualization object
      plot.vis = selection.append('svg')
        .attr('width', plot.width())
        .attr('height', plot.height());

      // Render the view.
      plot.render();

      // Generate the components
      plot.components()

      return plot;
    });
  };

  // Configure the plot
  Rna2D.config(plot, config);

  // Add and configure all components.
  Rna2D.components(plot, config);

  return plot;
};

// Stores the views of the structure
Rna2D.views = {};

