Rna2D.config = function(plot, given) {

  var config = { 
    nucleotides: [],
    interactions: [],
    motifs: [],
    margin: { left: 10, right: 10, above: 10, below: 10 },
    view: 'circular',
    width:  500,
    height: 1000,
    selection: null,
    xScale: null,
    yScale: null
  };

  Rna2D.utils.extend(config, given);
  Rna2D.utils.generateAccessors(plot, config);

  return plot;
};

