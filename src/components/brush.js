Rna2D.components.brush = (function() {

  var startBrush, updateBrush, endBrush;

  return {

    config: function(plot) {
      return {
        enabled: true,
        initial: [],
        'class': 'brush',
        update: Object,
        clear: Object
      };
    },

    actions: function(plot) {
      // Draw the brush around the given extent
      plot.brush.select = function(extent) {
        startBrush();
        plot.brush().extent(extent);
        updateBrush();
        plot.vis.select('.' + plot.brush['class']())
          .call(plot.brush());
        endBrush();
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

      plot.brush.jmol = function(nts) {
        var idOf = plot.nucleotides.getID(),
            ids = $.map(nts, idOf);
        return plot.jmol.showNTs(ids);
      };
    },

    generate: function(plot) {

      endBrush = function () {
        var nts = [];

        if (plot.brush().empty()) {
          plot.brush.clear();
        } else {

          var e = plot.brush().extent();

          plot.vis.selectAll('.' + plot.nucleotides['class']())
            .attr("selected", function(d) {
              if (e[0][0] <= d.__x && d.__x <= e[1][0] &&
                  e[0][1] <= d.__y && d.__y <= e[1][1]) {
                nts.push(d);
              return 'selected';
              }
              return '';
            });

          plot.brush.update()(nts);
        }
      };

      plot.brush(d3.svg.brush()
        .on('brushend', endBrush)
        .x(plot.xScale())
        .y(plot.yScale()));

      if (plot.brush.initial().length) {
        plot.brush.select(plot.brush.initial());
      }

      if (plot.brush.enabled()) {
        plot.brush.enable();
      }

      return plot.brush;
    }
  };

}());

