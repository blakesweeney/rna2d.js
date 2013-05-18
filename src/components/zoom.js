Rna2D.components.zoom = (function() {

  var zoom, 
      translation = 0;

  return {
    config: function() {
      return {
        scaleExtent: [1, 10],
        currentScale: 1,
        onChange: Object
      };
    },

    generate: function(plot) {
      zoom = d3.behavior.zoom()
        .x(plot.xScale())
        .y(plot.yScale())
        .scaleExtent(plot.zoom.scaleExtent())
        .on("zoom", function() {
          var scale = d3.event.scale,
              translate = d3.event.translate;

          plot.zoom.currentScale(scale);
          plot.zoom.onChange()();

          // What I am trying to do here is to ensure that as we zoom out we
          // always return to having the upper left corner in the upper left.
          // This is done by undoing all translations so far.
          if (scale === 1) {
            translate = -translation;
            translation = 0;
          } else {
            translation += translate;
          }
          // TODO: Consider using a spring like forcing function.
          // This would cause the screen to snap back to the correct position
          // more sharply. This could feel nice.

          plot.vis.attr("transform", "translate(" + translate + ")" +
                        "scale(" + scale + ")");
        });

      plot.vis.call(zoom);
    }
  };
}());
