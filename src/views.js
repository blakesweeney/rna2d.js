Rna2D.views = function(plot) { 

  // Generate the setup function, which draws the view.
  plot.view.setup = function() {
    var view = Rna2D.views[plot.view()];

    if (view === undefined) {
      console.log("Unknown view " + plot.view());
      return false;
    }

    // Overwrite all previous drawing functions
    plot.coordinates = view.coordinates;
    plot.connections = view.connections;
    plot.groups = view.groups;

    // Trigger the side effects
    view.sideffects();
  };

  plot.views = {};

  // Add all config
  _.chain(Rna2D.views)
    .keys()
    .each(function(name) {
      var view = Rna2D.views[name](plot),
          config = view.config;
      if (typeof(config) === "function") {
        config = config(plot);
      }
      plot.views[name] = {};
      Rna2D.utils.generateAccessors(plot.views[name], config);
      Rna2D.views[name] = view;
    });
};

