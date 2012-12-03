Rna2D.components.brush = function(plot, config) {

  var brush;

  plot.components.brush = function() {

    brush = d3.svg.brush()
      .on('brushstart', startBrush)
      .on('brush', updateBrush)
      .on('brushend', endBrush)
      .x(plot.__xScale)
      .y(plot.__yScale);

    // Blank for now, later may use this for a multiple selecting brush.
    function startBrush() { };

    // Do nothing for now.
    function updateBrush(p) { };

    function endBrush() {
      var matched = {};

      if (brush.empty()) {
        plot.brush.clear();
      } else {

        var e = brush.extent();
        plot.vis.selectAll('.' + plot.nucleotides.class())
          .attr("checked", function(d) {
            if (e[0][0] <= d.x && d.x <= e[1][0] && 
                e[0][1] <= d.y && d.y <= e[1][1]) {
              matched[d.id] = d;
            }
          });

        plot.brush.update(matched);
      };
    };

    if (plot.brush.initial().length) {
      plot.brush.select(plot.brush.initial());
    }

    if (plot.brush.enabled()) {
      plot.brush.enable();
    };

    return plot;
  };

  plot.brush = function() { return brush; };

  // --------------------------------------------------------------------------
  // Brush configure options
  // --------------------------------------------------------------------------
  (function(given) {
    var brush = given.brush || {},
        enabled = ('enabled' in brush ? brush.enabled : true),
        initial = ('initial' in brush ? brush.initial : []),
        klass = brush['class'] || 'brush',
        update = brush.update || Object,
        clear = brush.clear || Object;

    plot.brush.enabled = function(_) {
      if (!arguments.length) return enabled;
      enabled = _;
      return plot;
    };

    plot.brush.initial = function(_) {
      if (!arguments.length) return initial;
      initial = _;
      return plot;
    };

    plot.brush.class = function(_) {
      if (!arguments.length) return klass;
      klass = _;
      return plot;
    };

    plot.brush.update = function(_) {
      if (!arguments.length) return update;
      update = _;
      return plot;
    };

    plot.brush.clear = function(_) {
      if (!arguments.length) return clear;
      clear = _;
      return plot;
    };

  })(config);

  // Draw the brush around the given extent
  // TODO: Do this correctly.
  plot.brush.select = function(extent) {
    brush.extent(extent);
    brush(plot.selection());
    return plot;
  };

  // Show the brush
  plot.brush.enable = function() {
    plot.vis.append('g')
      .classed(plot.brush.class(), true)
      .call(brush);
    plot.brush.enabled(true);
    return plot;
  };

  // Hide the brush
  plot.brush.disable = function() {
    plot.vis.selectAll('.' + plot.brush.class()).remove();
    plot.brush.enabled(false);
    return plot;
  };

  // Toggle the brush
  plot.brush.toggle = function() {
    if (plot.brush.enabled()) {
      return plot.brush.disable();
    };
    return plot.brush.enable();
  };

  return Rna2D;
};

