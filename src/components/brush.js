Rna2D.components.brush = function(plot) {

  var Brush = Rna2D.setupComponent('brush', {
    enabled: true,
    'class': 'brush',
    update: Object,
    clear: Object
  });

  Brush.prototype.enable = function() {
    plot.vis.append('g')
      .classed(plot.brush['class'](), true)
      .call(plot.brush());
    this.enabled(true);
    return this;
  };

  Brush.prototype.disable = function() {
    plot.vis.selectAll('.' + plot.brush['class']()).remove();
    this.enabled(false);
    return this;
  };

  Brush.prototype.toggle = function() {
    return (this.enabled() ? this.disable() : this.enable());
  };

  Brush.prototype.draw = function() {

    var scale = function(given) {
        return d3.scale.identity().domain(given.domain());
      }, 
      brush = d3.svg.brush()
        .x(scale(plot.xScale()))
        .y(scale(plot.yScale()));

    brush.on('brushend', function () {
      var nts = [],
          extent = brush.extent();

      if (brush.empty()) {
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
    });

    plot.brush(brush);

    if (this.enabled()) {
      this.enable();
    }

    return this;
  };

  var brush = new Brush();
  brush.attach(plot);

  return brush;
};

