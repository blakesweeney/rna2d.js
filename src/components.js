Rna2D.components = function(plot) {

  plot.components = function() {
    for(var name in plot.components) {
      plot.components[name](plot);
    }
  };

  for(var name in Rna2D.components) {
    var obj = Rna2D.components[name];

    (function(name) {
      var data = null;
      plot[name] = function(x) {
        if (!arguments.length) {
          return data;
        }
        data = x;
        return plot[name];
      };
    })(name);

    if (typeof(obj.config) === "function") {
      obj.config = obj.config(plot);
    }
    Rna2D.utils.generateAccessors(plot[name], obj.config);

    if ('sideffects' in obj) {
      obj.sideffects(plot);
    }
  }

  plot.components[name] = function(plot) {
    for(var name in Rna2D.components) {
      var obj = Rna2D.components[name];

      if ('actions' in obj) {
        obj.actions(plot);
      }

      if ('generate' in obj) {
        obj.generate(plot);
      }
    }

    return plot;
  };

  return Rna2D;
};

