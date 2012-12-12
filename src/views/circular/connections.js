Rna2D.views.circular.connections = function(plot) {

  plot.connections = function(standard) {

    var getNTs = plot.interactions.getNTs();

   // Use to compute where to place the arcs for interaction arcs.
   var innerArc = d3.svg.arc()
          .outerRadius(plot.__innerRadius)
          .innerRadius(plot.__innerRadius - 3)
          .startAngle(plot.__startAngle)
          .endAngle(plot.__endAngle);

    var position = function(ntId) {
      var centroid = innerArc.centroid(null, plot.nucleotides.indexOf(ntId)),
          c = plot.__circleCenter;
      return { x: c.x + centroid[0], y: c.y + centroid[1] };
    };

    var curve = function(d, i) {
      var nts = getNTs(d),
          from = position(nts[0]),
          to = position(nts[1]),
          distance = Rna2D.utils.distance(from, to),
          center = plot.__circleCenter; // TODO: Move center to get better arcs.

      return "M "  + from.x              + " " + from.y +
             " A " + (distance / 2) + "," + (distance / 2) +
             " " + 0 + // Rotation
             " " + 0 + " " + 0 +  // Large Arc and Sweep flag
             " " + to.x + "," + to.y;
    };

    var data = plot.interactions.valid();//.slice(1, 3);

    plot.vis.selectAll(plot.interactions.class())
      .data(data).enter().append('path')
      .call(standard)
      .attr('d', curve)
      .attr('fill', 'none')
      .attr('stroke', plot.interactions.color());

    return plot;
  };

  return Rna2D;
};
