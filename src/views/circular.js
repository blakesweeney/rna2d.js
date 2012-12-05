Rna2D.views.circular = function(plot) {

  // Configure
  Rna2D.views.circular.coordinates(plot);
    // .views.circular.connections(plot)

  // Generate rendering function
  plot.render = function() {
    return plot.coordinates();
      // .connections();
  };

  return Rna2D;
};
