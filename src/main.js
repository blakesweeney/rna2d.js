Rna2D = function(config) {
  var plot = function(selection) {

    // Set the selection to the given one.
    if (selection) {
      plot.selection(selection);
    }

    d3.select(plot.selection()).call(function(sel) {

      // Compute the nucleotide ordering. This is often used when drawing
      // interactions.
      plot.nucleotides.computeOrder();

      // Create visualization object
      plot.vis = sel.append('svg')
        .attr('width', plot.width())
        .attr('height', plot.height());

      // Draw all coordinates and attach all standard data
      plot.coordinates(function(selection) {
        var classOf = function(d, i) {
          var base = plot.nucleotides.class(),
              computed = plot.nucleotides.classOf()(d, i);
          return base + ' ' + computed;
        };

        return selection.attr('id', plot.nucleotides.getID())
          .classed(plot.nucleotides.class(), true)
          .attr('class', classOf)
          .on('click', plot.nucleotides.mouseover())
          .on('mouseover', plot.nucleotides.mouseover())
          .on('mouseout', plot.nucleotides.mouseout());
      });

      // Draw all interactions and add all common data
      plot.connections(function(sele) {
        var ntsOf = plot.interactions.getNTs(),
            visible = plot.interactions.visible();

        return sele.attr('id', plot.interactions.getID())
          .classed(plot.interactions.class(), true)
          // .attr('class', plot.interactions.classOf())
          .attr('visibility', function(d) { return (visible(d) ? 'visible' : 'hidden'); })
          .attr('data-nts', function(d, i) { return ntsOf(d).join(',') })
          .attr('nt1', function(d, i) { return ntsOf(d)[0]; })
          .attr('nt2', function(d, i) { return ntsOf(d)[1]; })
          .on('click', plot.interactions.click())
          .on('mouseover', function() { console.log(this) })// plot.interactions.mouseover())
          .on('mouseout', plot.interactions.mouseout());
      });

      // Sometimes we draw motifs - It's not always needed.
      if (plot.groups && plot.motifs().length) {
        plot.groups();
      }

      // Generate the components - brush, frame, zoom, etc
      plot.components();

      return plot;
    });
  };

  // Configure the plot
  Rna2D.config(plot, config);
  Rna2D.interactions(plot, config);
  Rna2D.nucleotides(plot, config);
  Rna2D.motifs(plot, config);

  // Add and configure all components.
  Rna2D.components(plot, config);

  // Setup the view
  Rna2D.views(plot, config);

  return plot;
};

