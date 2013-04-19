Rna2D.components = function(plot) {

  // Create the toplevel component which calls each subcomponent component
  plot.components = function() {
    _.chain(plot.components)
      .functions()
      .each(function(funcName) { plot.components[funcName](plot); });
  };

  // Create each subcomponent with its accessor function, config, side 
  // effects, and rendering function.
  _.chain(Rna2D.components)
    .keys()
    .each(function(name) {
      var obj = Rna2D.components[name];

      // Generate the accessor function
      (function(prop) {
        var data = null;
        plot[prop] = function(x) {
          if (!arguments.length) {
            return data;
          }
          data = x;
          return plot[prop];
        };
      }(name));

      // Attach config if needed.
      if (typeof(obj.config) === "function") {
        obj.config = obj.config(plot);
      }
      Rna2D.utils.generateAccessors(plot[name], obj.config);

      // Perform the side effects. These often create functions which need to be
      // created before the plot is drawn.
      if (obj.hasOwnProperty('sideffects')) {
        obj.sideffects(plot);
      }

      // Generate the rendering function, which creates the actions and then runs
      // generate if needed.
      plot.components[name] = function(plot) {
        if (obj.hasOwnProperty('actions')) {
          obj.actions(plot);
        }
        if (obj.hasOwnProperty('generate')) {
          obj.generate(plot);
        }

        return plot;
      };

    });

  return Rna2D;
};

