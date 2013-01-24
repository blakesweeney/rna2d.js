Rna2D.views.circular.connections = function(plot) {

  plot.connections = function(standard) {

    var getNTs = plot.interactions.getNTs();

   // Use to compute where to place the arcs for interaction arcs.
   var innerArc = d3.svg.arc()
          .outerRadius(plot.__ntArc.innerRadius()())
          .innerRadius(plot.__ntArc.innerRadius()() - 3)
          .startAngle(plot.__ntArc.startAngle())
          .endAngle(plot.__ntArc.endAngle());

    var position = function(ntId) {
      var centroid = innerArc.centroid(null, plot.nucleotides.indexOf(ntId)),
          c = plot.__circleCenter;
      return { x: c.x + centroid[0], y: c.y + centroid[1] };
    };

    var curve = function(d, i) {
      var startAngle = innerArc.startAngle(),
          nts = getNTs(d),
          from = position(nts[0]),
          to = position(nts[1]),
          distance = Rna2D.utils.distance(from, to),
          angleDiff = startAngle(null, plot.nucleotides.indexOf(nts[0])) -
                      startAngle(null, plot.nucleotides.indexOf(nts[1])),
          radius = innerArc.innerRadius()() * Math.tan(angleDiff/2),
          sweep  = 0;

      if (plot.nucleotides.indexOf(nts[0]) > plot.nucleotides.indexOf(nts[1])) {
        sweep = 1;
      }

      return "M "  + from.x + " " + from.y +     // Start point
             " A " + radius + "," + radius +     // Radii of elpise
             " " + 0 +                           // Rotation
             " " + 0 + " " + sweep +             // Large Arc and Sweep flag
             " " + to.x + "," + to.y;            // End point

    };

    plot.vis.selectAll(plot.interactions['class']())
      .data(plot.interactions.valid()).enter().append('path')
      .call(standard)
      .attr('d', curve)
      .attr('fill', 'none')
      .attr('stroke', plot.interactions.color());

    return plot;
  };

  plot.interactions.highlight(function() {
    var obj = this,
        highlightColor = plot.interactions.highlightColor(),
        nts = plot.interactions.nucleotides(obj);

    d3.select(obj).style('stroke', highlightColor(obj));
    plot.pie.addLetters()(nts[0]); // TODO: WTF?

    return nts.style('stroke', highlightColor(obj));
  });

  plot.interactions.normalize(function() {
    var obj = this;
    d3.select(obj).style('stroke', null);
    plot.pie.clearLetters()();
    plot.interactions.nucleotides(obj).style('stroke', null);
    return plot.interactions;
  });

  return Rna2D;
};
