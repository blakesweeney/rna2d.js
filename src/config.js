Rna2D.config = function(plot, given) {

  var config = { 
    labels: [],
    margin: { left: 10, right: 10, above: 10, below: 10 },
    view: 'circular',
    width:  500,
    height: 1000,
    selection: null,
    xScale: null,
    yScale: null
  };

  Rna2D.utils.generateAccessors(plot, $.extend(config, given));

  return plot;
};

