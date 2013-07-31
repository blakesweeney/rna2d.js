var Rna2D = window.Rna2D || function(config) {

  var plot = function() {

    // Setup the drawing area
    var margin = plot.margin(),
        selection = d3.select(plot.selection());

    selection.select('svg').remove();
    var top = selection.append('svg')
      .attr('width', plot.width() + margin.left + margin.right)
      .attr('height', plot.height() + margin.above + margin.below);

    plot.vis = top.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.above + ")");

    // Generate the view
    var view = views.current();
    if (view) {
      var scale = function(domain, max) {
          return d3.scale.linear().domain(domain).range([0, max]);
        };

      view.preprocess();

      // Setup the scales
      plot.xScale(scale(view.xDomain(), plot.width() - margin.right));
      plot.yScale(scale(view.yDomain(), plot.height() - margin.above));

      // Generate the components - brush, frame, zoom, etc
      components.generate();

      view.generate();
    }

    return plot;
  };

  // Configure the plot
  Rna2D.utils.generateAccessors(plot, $.extend({
    labels: [],
    margin: { left: 10, right: 10, above: 10, below: 10 },
    view: 'circular',
    width:  500,
    height: 1000,
    selection: null,
    xScale: null,
    yScale: null
  }, config));

  // Add all components and views.
  var components = new Rna2D.Components(),
      views = new Rna2D.Views();

  components.attach(plot);
  views.attach(plot);

  return plot;
};

// Some namespaces.
Rna2D.views = {};
Rna2D.components = {};

window.Rna2D = Rna2D;

