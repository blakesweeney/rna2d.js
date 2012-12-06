Rna2D.views.circular.connections = function(plot) {

  plot.connections = function() {

    var getID = plot.nucleotides.getID(),
        raw = plot.nucleotides();

    var curve = function(d, i) {
      var from = plot.pie.ntCoordinates(d.nt1)
          to = plot.pie.ntCoordinates(d.nt2)
          center = plot.__circleCenter, // TODO: Move center to get better arcs.
          control = { x: center.x - from.x, y: center.y - from.y },
          final = { x: to.x - from.x, y: to.y - from.y };

      return "M " + from.x + " " + from.y + 
             " q " + control.x + " " + control.y + 
             " " + final.x + " " + final.y;
    };

    var interactions = [],
        raw = plot.interactions(),
        seen = {},
        idOf = function(nt1, nt2, family) { return nt1 + ',' + nt2 + ',' + family; };

    for(var i = 0; i < raw.length; i++) {
      var obj = raw[i],
          nt1 = Rna2D.utils.element(obj.nt1),
          nt2 = Rna2D.utils.element(obj.nt2),
          id = idOf(obj.nt1, obj.nt2, obj.family),
          revId = idOf(obj.nt2, obj.nt1, obj.family);

      if (nt1 && nt2) {
        if (!seen[id] && !seen[revId]) {
          var family = obj.family;
          if (family[1] == family[2]) {
            seen[id] = true;
          };

          interactions.push(obj);
        }
      }
    };

    var visible = plot.interactions.visible();

    plot.vis.selectAll(plot.interactions.class())
      .data(interactions).enter().append('path')
      .attr('id', function(d) { return idOf(d.nt1, d.nt2, d.family); })
      .classed(plot.interactions.class(), true)
      .attr('d', curve)
      .attr('fill', 'none')
      .attr('stroke', 'black')//plot.interactions.color())
      .attr('visibility', function(d, i) { return (visible(d) ? 'visible' : 'hidden'); })
      .attr('nt1', function(d, i) { return d.nt1; })
      .attr('nt2', function(d, i) { return d.nt2; })
      .on('click', plot.interactions.click())
      .on('mouseover', function() { console.log(this) })// plot.interactions.mouseover())
      .on('mouseout', plot.interactions.mouseout());
      ;

    return plot;
  };

  return Rna2D;
};
