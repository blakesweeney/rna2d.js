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

    plot.redraw();

    return plot;
  };

  // Redraw all elements.
  plot.redraw = function() {

    // A function to call when we are building the nts, interactions or motifs.
    // All have some steps in common so we move them somewhere common.
    var standardBuild = function(type) {
          return function(selection) {
            var klass = type['class'](),
                classOf = type.classOf();

            Rna2D.utils.attachHandlers(selection, type);

            return selection.attr('id', type.elementID)
              .attr('class', function(d, i) { return classOf(d, i).concat(klass).join(' '); })
              .attr('visibility', type.visibility);
          };
        },
        standardNts = standardBuild(plot.nucleotides),
        standardGroups = standardBuild(plot.motifs),
        standardInteractions = standardBuild(plot.interactions);

    // Draw all coordinates and attach all standard data
    plot.coordinates(function(selection) {

      var x = plot.views[plot.view()].xCoord(),
          y = plot.views[plot.view()].yCoord();

      return standardNts(selection)
        .datum(function(d, i) {
          d.__x = x(d, i);
          d.__y = y(d, i);
          return d;
        });
    });

    // Draw all interactions and add all common data
    plot.connections(standardInteractions);

    // Draw motifs
    plot.groups(standardGroups);
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

