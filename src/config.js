Rna2D.config = function(plot, given) {

  var nucleotides = given.nucleotdies || [],
      interactions = given.interactions || [],
      motifs = given.motifs || [],
      margin = given.margin || { left: 10, right: 10, above: 10, below: 10 },
      view = given.view || 'circular',
      width =  given.width || 500,
      height = given.height || 1000,
      selection = given.selection;

  plot.selection = function(_) {
    if (!arguments.length) return selection;
    selection = _;
    return plot;
  };

  plot.view = function(_) {
    if (!arguments.length) return view;
    view = _;
    return plot;
  };

  plot.margin = function(_) {
    if (!arguments.length) return margin;
    margin = _;
    return plot;
  };

  plot.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    return plot;
  };

  plot.height = function(_) {
    if (!arguments.length) return height;
    height = _;
    return plot;
  };


  plot.view(view);

  return plot;
};

