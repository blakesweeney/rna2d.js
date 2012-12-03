Rna2D.components = function(plot, config) {

  plot.components = function() {
    for(var name in plot.components) {
      plot.components[name](plot);
    };
  };

  for(var name in Rna2D.components) {
    Rna2D.components[name](plot, config);
  };

  return Rna2D;
}
