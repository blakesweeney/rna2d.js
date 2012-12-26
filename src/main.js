var Rna2D = window.Rna2D || function(config) {
  var plot = function(selection) {

    // Set the selection to the given one.
    if (selection) {
      plot.selection(selection);
    }

    // Setup the view
    var view = Rna2D.views[plot.view()];
    view.coordinates(plot);
    view.connections(plot);
    view.groups(plot);

    d3.select(plot.selection()).call(function(sel) {

      // Compute the nucleotide ordering. This is often used when drawing
      // interactions.
      plot.nucleotides.computeOrder();

      plot.vis = sel.append('svg')
        .attr('width', plot.width())
        .attr('height', plot.height());

      // ----------------------------------------------------------------------
      // Draw all coordinates and attach all standard data
      // ----------------------------------------------------------------------
      plot.coordinates(function(selection) {

        selection.attr('id', plot.nucleotides.getID())
          .attr('class', function(d, i) {
            return plot.nucleotides['class']() + ' ' + plot.nucleotides.classOf()(d, i);
          });

        Rna2D.utils.attachHandlers(selection, plot.nucleotides);

        return selection;
      });

      // ----------------------------------------------------------------------
      // Draw all interactions and add all common data
      // ----------------------------------------------------------------------
      plot.connections(function(selection) {
        var ntsOf = plot.interactions.getNTs(),
            visible = plot.interactions.show();

        selection.attr('id', plot.interactions.getID())
          .attr('class', function(d, i) {
            return plot.interactions['class']() + ' ' + plot.interactions.classOf()(d, i);
          })
          .attr('visibility', function(d) { return (visible(d) ? 'visible' : 'hidden'); })
          .attr('data-nts', function(d, i) { return ntsOf(d).join(','); })
          .attr('nt1', function(d, i) { return ntsOf(d)[0]; })
          .attr('nt2', function(d, i) { return ntsOf(d)[1]; });

        Rna2D.utils.attachHandlers(selection, plot.interactions);

        return selection;
      });

      // ----------------------------------------------------------------------
      // Draw motifs
      // ----------------------------------------------------------------------
      plot.groups(function(selection) {
        var ntsOf = plot.motifs.getNTs();

        selection.attr('id', plot.motifs.getID())
          .attr('class', function(d, i) {
            return plot.motifs['class']() + ' ' + plot.motifs.classOf()(d, i);
          })
          .attr('data-nts', function(d) { return plot.motifs.getNTs()(d).join(','); })
          .attr('visibility', function(d) { return (d.visible ? 'visible' : 'hidden'); });

        Rna2D.utils.attachHandlers(selection, plot.motifs);

        return selection;
      });

      // Generate the components - brush, frame, zoom, etc
      plot.components();

      return plot;
    });
  };

  // Configure the plot
  Rna2D.config(plot, config);

  // Add all components.
  Rna2D.components(plot);

  return plot;
};

window.Rna2D = Rna2D;

