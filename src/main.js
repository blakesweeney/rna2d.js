var Rna2D = window.Rna2D || function(config) {

  var plot = function() {

    // Setup the view
    plot.view.setup();

    var margin = plot.margin(),
        selection = d3.select(plot.selection()),
        scale = function(domain, max) {
          return d3.scale.linear().domain(domain).range([0, max]);
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

    // A function to call when we are building the nts, interactions or motifs.
    // All have some steps in common so we move them somewhere common.
    var standardBuild = function(type) {
      return function(selection) {
        var klass = type['class'](),
            classOf = type.classOf();

        Rna2D.utils.attachHandlers(selection, type);

        return selection.attr('id', type.elementID)
          .attr('class', function(d, i) {
            return classOf(d, i).concat(klass).join(' ');
          })
          .attr('visibility', type.visibility);
      };
    };

    // Draw all coordinates and attach all standard data
    plot.coordinates(function(selection) {

      var x = plot.views[plot.view()].xCoord(),
          y = plot.views[plot.view()].yCoord();

      return standardBuild(plot.nucleotides)(selection)
        .datum(function(d, i) {
          d.__x = x(d, i);
          d.__y = y(d, i);
          return d;
        });
    });

    // Draw all interactions and add all common data
    plot.connections(standardBuild(plot.interactions));

    // Draw motifs
    plot.groups(standardBuild(plot.motifs));

    return plot;
  };

  // Configure the plot
  Rna2D.utils.generateAccessors(plot, $.extend(config, {
    labels: [],
    margin: { left: 10, right: 10, above: 10, below: 10 },
    view: 'circular',
    width:  500,
    height: 1000,
    selection: null,
    xScale: null,
    yScale: null
  }));

  // Add all components.
  Rna2D.components(plot);

  // Add the views
  Rna2D.views(plot);

  return plot;
};

window.Rna2D = Rna2D;

