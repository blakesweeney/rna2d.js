// Stores the views of the structure
Rna2D.views = function(plot) {

  var name = plot.view(),
      view = Rna2D.views[name];

  view.coordinates(plot);
  view.connections(plot);
  view.groups(plot);

  return Rna2D;
};

// TODO: Organize so we don't have to add this silly setup.
// Some builtin views.
Rna2D.views.airport = {};
Rna2D.views.circular = {};

