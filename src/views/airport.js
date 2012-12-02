// Container for the airport view
Rna2D.views.airport = function(plot) {

  // Configure all components of the plot
  Rna2D.views.airport.coordinates(plot)
    .views.airport.connections(plot)
    .views.airport.groups(plot);

  var airport = function() {
    return plot.coordinates()
      .connections()
      .groups();
  };

  plot.render = airport;

  return Rna2D;
};

