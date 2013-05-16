Rna2D.components = function(plot) {

  var actions = false;

  // Create the toplevel component which calls each subcomponent component
  plot.components = function() {

    $.each(Rna2D.components, function(name, obj) {

      if (obj.hasOwnProperty('actions') && !actions) {
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

    actions = true;
  };

  // Create each subcomponent with its accessor function, config, side 
  // effects, and rendering function.
  $.each(Rna2D.components, function(name, obj) {

    // Generate the accessor function if needed
    if (obj.dataStore) {
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
    }

    Rna2D.utils.generateAccessors(plot[name], obj.config(plot));

    // Perform the side effects. These often create functions which need to be
    // created before the plot is drawn.
    if (obj.hasOwnProperty('sideffects')) {
      obj.sideffects(plot);
    }

    if (plot[name].hasOwnProperty('encodeID') && plot[name].hasOwnProperty('getID')) {
      plot[name].elementID = function(d, i) {
        var encode = plot[name].encodeID(),
            getID = plot[name].getID();
        return encode(getID(d, i));
      };
    }

    if (plot[name].hasOwnProperty('getNTs')) {
      (function(prop) {
        plot[prop].ntElements = function(d, i) {
          var getNTs = plot[prop].getNTs();
          return $.map(getNTs(d, i), plot.nucleotides.encodeID());
        };
      }(name));
    }

    plot.components[name] = obj;
  });

  return Rna2D;
};

