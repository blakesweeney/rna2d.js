Rna2D.brush = function(plot) {

  var brush = function() {

    function startBrush() {
      // Check if click within the bounding box of all nts or interactions.
      // Ugh. Such a pain. Maybe do this later.
    };

    // Do nothing for now.
    function updateBrush(p) { };

    function endBrush() {
      var matched = {};
      if (brush.empty()) {
        plot.brush.clear();
      } else {
        var e = brush.extent();
        vis.selectAll('.' + plot.nucleotides.class())
          .attr("checked", function(d) {
            var inside = e[0][0] <= d.x && d.x <= e[1][0]
              && e[0][1] <= d.y && d.y <= e[1][1];
            if (inside) {
              matched[d.id] = d;
            }
          });
        plot.brush.update(matched);
      };
    };

    var brush = d3.svg.brush()
      .on('brushstart', startBrush)
      .on('brush', updateBrush)
      .on('brushend', endBrush)
      .x(plot.__xScale)
      .y(plot.__yScale);

    // TODO: Do this correctly.
    if (plot.brush.initial()) {
      plot.select(plot.brush.initial());
    }

    return plot;
  };

  plot.brush = brush;

  // Draw the brush around the given extent
  plot.brush.select = function(extent) {
    brush.extent([]);
    startBrush();
    brush.extent(extent);
    updateBrush();
    endBrush();
    return plot;
  };

  // Show the brush
  plot.brush.enable = function() {
    vis.append('g')
      .classed(plot.brush.class(), true)
      .call(brush);
    plot.brush.enabled(true);
    return plot;
  };

  // Hide the brush
  plot.brush.disable = function() {
    vis.selectAll('.' + plot.brush.class()).remove();
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

