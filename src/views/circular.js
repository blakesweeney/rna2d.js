Rna2D.views.circular = function(plot) {

  // Configure
  Rna2D.views.circular.coordinates(plot)
    .views.circular.connections(plot);

  // Generate rendering function
  plot.render = function() {
    plot.coordinates().connections();

    // Add motifs as needed
    // if (plot.groups && plot.motifs().length) {
    //   plot.groups();
    // }

    return plot;
  };

  return Rna2D;
};
