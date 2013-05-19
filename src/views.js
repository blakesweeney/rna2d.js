Rna2D.views = function(plot) { 

  // Generate the setup function, which draws the view.
  plot.view.setup = function() {
    var view = Rna2D.views[plot.view()];

    if (view === undefined) {
      console.log("Unknown view " + plot.view());
      return false;
    }

    var domain = view.domain();

    // Overwrite all previous drawing functions
    plot.coordinates = view.coordinates;
    plot.connections = view.connections;
    plot.groups = view.groups;
    plot.xDomain = domain.x;
    plot.yDomain = domain.y;

    // Trigger the side effects
    view.sideffects();
  };

  plot.views = {};

  // Add all config
  $.each(Rna2D.views, function(name, view) {
      view = view(plot);
      var config = view.config;
      if (typeof(config) === "function") {
        config = config(plot);
      }
      plot.views[name] = {};
      Rna2D.utils.generateAccessors(plot.views[name], config);
      Rna2D.views[name] = view;
    });
};

