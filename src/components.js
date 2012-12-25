Rna2D.components = function(plot) {

  plot.components = function() {
    for(var name in plot.components) {
      plot.components[name](plot);
    }
  };

  for(var name in Rna2D.components) {
    var obj = Rna2D.components[name];

    if ('self' in obj) {
      plot[name] = function() {
        obj.self.apply(this, arguments);
        return plot[name];
      };
    } else {
      plot[name] = {};
    }

    Rna2D.utils.generateAccessors(plot[name], obj.config);

    if ('sideffects' in obj) {
      obj.sideffects(plot);
    }

    plot.components[name] = function(plot) {
      if ('actions' in obj) {
        obj.actions(plot);
      }

      if ('generate' in obj) {
        obj.generate(plot);
      }

      return plot;
    };
  }

  return Rna2D;
};

