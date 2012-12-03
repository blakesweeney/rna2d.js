Rna2D.components = function(plot) {

  plot.components = function() {
    for(var name in plot.components) {
      plot.components[name](plot)
    };
  }

  for(var name in Rna2D.components) {
    Rna2D.components[name](plot)
  };

  return Rna2D;
}
