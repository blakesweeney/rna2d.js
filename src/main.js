var Rna2D = window.Rna2D || function(config) {
  var plot = function() {

    // Compute the nucleotide ordering. This is often used when drawing
    // interactions.
    plot.nucleotides.computeOrder();

    // Setup the view
    plot.view.setup();

    var margin = plot.margin(),
        selection = d3.select(plot.selection()),
        scale = function(domainFn, max) { 
          return d3.scale.linear().domain(domainFn()).range([0, max]);
        };

    // Setup the overall drawing area
    selection.select('svg').remove();
    var top = selection.append('svg')
      .attr('width', plot.width() + margin.left + margin.right)
      .attr('height', plot.height() + margin.above + margin.below);

    plot.vis = top.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.above + ")");

    // Setup the scales
    plot.xScale(scale(plot.xDomain, plot.width() - margin.right));
    plot.yScale(scale(plot.yDomain, plot.height() - margin.above));

    // Generate the components - brush, frame, zoom, etc
    plot.components();

    // Draw all coordinates and attach all standard data
    plot.coordinates(function(selection) {

      var x = plot.views[plot.view()].xCoord(),
          y = plot.views[plot.view()].yCoord(),
          classOf = plot.nucleotides.classOf(),
          klass = plot.nucleotides['class']();

      selection.attr('id', plot.nucleotides.getID())
        .attr('class', function(d, i) { return classOf(d, i).concat(klass).join(' '); })
        .datum(function(d, i) {
          d.__x = x(d, i);
          d.__y = y(d, i);
          return d;
        })
        .attr('visibility', plot.nucleotides.visiblity)
        .attr('data-sequence', plot.nucleotides.getSequence());

      Rna2D.utils.attachHandlers(selection, plot.nucleotides);

      return selection;
    });

    // Draw all interactions and add all common data
    plot.connections(function(selection) {
      var ntsOf = plot.interactions.getNTs(),
          classOf = plot.interactions.classOf(),
          klass = plot.interactions['class']();

      selection.attr('id', plot.interactions.getID())
        .attr('class', function(d, i) { return classOf(d, i).concat(klass).join(' '); })
        .attr('visibility', plot.interactions.visibilityString)
        .attr('data-nts', function(d, i) { return ntsOf(d).join(','); })
        .attr('nt1', function(d, i) { return ntsOf(d)[0]; })
        .attr('nt2', function(d, i) { return ntsOf(d)[1]; });

      Rna2D.utils.attachHandlers(selection, plot.interactions);

      return selection;
    });

    // Draw motifs
    plot.groups(function(selection) {
      var ntsOf = plot.motifs.getNTs(),
          classOf = plot.motifs.classOf(),
          klass = plot.motifs['class']();

      selection.attr('id', plot.motifs.getID())
        .attr('class', function(d, i) { return classOf(d, i).concat(klass).join(' '); })
        .attr('data-nts', function(d) { return plot.motifs.getNTs()(d).join(','); })
        .attr('visibility', plot.motifs.visibility);

      Rna2D.utils.attachHandlers(selection, plot.motifs);

      return selection;
    });

    return plot;
  };

  // Configure the plot
  Rna2D.config(plot, config);

  // Add all components.
  Rna2D.components(plot);

  // Add the views
  Rna2D.views(plot);

  return plot;
};

window.Rna2D = Rna2D;

