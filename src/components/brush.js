Rna2D.components.brush = (function() {

  return {

    dataStore: true,
    config: function(plot) {
      return {
        enabled: true,
        'class': 'brush',
        update: Object,
        clear: Object
      };
    },

    actions: function(plot) {

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

      var endBrush = function () {
        var nts = [],
            extent = plot.brush().extent();

        if (plot.brush().empty()) {
          return plot.brush.clear()();
        }

        plot.vis.selectAll('.' + plot.nucleotides['class']())
          .attr("selected", function(d) {
            if (extent[0][0] <= d.__x && d.__x <= extent[1][0] &&
                extent[0][1] <= d.__y && d.__y <= extent[1][1]) {
              nts.push(d);
            return 'selected';
            }
            return '';
          });

        return plot.brush.update()(nts);
      };

      var scale = function(given) {
        return d3.scale.identity()
          .domain(given.domain());
      };

      plot.brush(d3.svg.brush()
        .on('brushend', endBrush)
        .x(scale(plot.xScale()))
        .y(scale(plot.yScale())));

      if (plot.brush.enabled()) {
        plot.brush.enable();
      }

      return plot.brush;
    }
  };

}());

