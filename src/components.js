Rna2D.components = function(plot) {

  // Create the toplevel component which calls each subcomponent component
  plot.components = function() {
    $.each(Rna2D.components, function(name, obj) {

      if (obj.hasOwnProperty('actions')) {
        // If something is toggable we will add all the toggable functions.
        if (obj.togglable) {
          Rna2D.togglable(plot, name);
        }

        obj.actions(plot);
      }

      if (obj.hasOwnProperty('generate')) {
        try {
          obj.generate(plot);
        } catch (except) {
          console.log("Error generating component " + name);
          console.log(except);
        }
      }
    });
  };

  // Create each subcomponent with its accessor function, config, side 
  // effects, and rendering function.
  $.each(Rna2D.components, function(name, obj) {

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

    Rna2D.utils.generateAccessors(plot[name], obj.config(plot));

    // Perform the side effects. These often create functions which need to be
    // created before the plot is drawn.
    if (obj.hasOwnProperty('sideffects')) {
      obj.sideffects(plot);
    }

    plot.components[name] = obj;
  });

  return Rna2D;
};

