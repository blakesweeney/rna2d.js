Rna2D.components.brush = function() {

  return {

    config: {
      enabled: true,
      initial: [],
      'class': 'brush',
      update: Object,
      clear: Object
    },

    actions: function(plot) {
      // Draw the brush around the given extent
      plot.brush.select = function(extent) {
        plot.brush().extent(extent);
        plot.brush()(d3.select(plot.selection()));
        return plot.brush;
      };

      // Show the brush
      plot.brush.enable = function() {
        plot.vis.append('g')
          .classed(plot.brush['class'](), true)
          .call(plot.brush());
        plot.brush.enabled(true);
        return plot.brush;
      };

      // Hide the brush
      plot.brush.disable = function() {
        plot.vis.selectAll('.' + plot.brush['class']()).remove();
        plot.brush.enabled(false);
        return plot.brush;
      };

      // Toggle the brush
      plot.brush.toggle = function() {
        if (plot.brush.enabled()) {
          return plot.brush.disable();
        }
        return plot.brush.enable();
      };
    },

    generate: function(plot) {
      plot.brush(d3.svg.brush()
        .on('brushstart', startBrush)
        .on('brush', updateBrush)
        .on('brushend', endBrush)
        .x(plot.xScale())
        .y(plot.yScale()));

      // Blank for now, later may use this for a multiple selecting brush.
      function startBrush () { }

      // Do nothing for now.
      function updateBrush (p) { }

      function endBrush () {
        var matched = {};

        if (plot.brush().empty()) {
          plot.brush.clear();
        } else {

          var e = plot.brush().extent(),
              getID = plot.nucleotides.getID();
          plot.vis.selectAll('.' + plot.nucleotides['class']())
            .attr("checked", function(d) {
              if (e[0][0] <= d.__x && d.__x <= e[1][0] &&
                  e[0][1] <= d.__y && d.__y <= e[1][1]) {
                matched[getID(d)] = d;
              }
            });

          plot.brush.update()(matched);
        }
      }

      if (plot.brush.initial().length) {
        plot.brush.select(plot.brush.initial());
      }

      if (plot.brush.enabled()) {
        plot.brush.enable();
      }

      return plot.brush;
    }
  };

}();

