Rna2D.components.zoom = function(plot) {

  var Zoom = Rna2D.setupComponent('zoom', {
    scaleExtent: [1, 10],
    currentScale: 1,
    onChange: Object
  });

  Zoom.prototype.draw = function() {
    var translation = 0,
        zoom = d3.behavior.zoom()
          .x(this.plot.xScale())
          .y(this.plot.yScale())
          .scaleExcent(this.plot.zoom.scaleExtent());

      zoom.on("zoom", function() {
          var scale = d3.event.scale,
              translate = d3.event.translate;

          this.plot.zoom.currentScale(scale);
          this.plot.zoom.onChange()();

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

          this.plot.vis.attr("transform", "translate(" + translate + ")" +
                             "scale(" + scale + ")");
      });

      this.plot.zoom(zoom);
      this.plot.vis.call(zoom);
  };

  var zoom = new Zoom();
  zoom.attach(plot);

};
