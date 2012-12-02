Rna2D.views.airport.groups = function(plot) {

  var my = function() {
      // Compute a box around the motif
      var motifs = plot.motifs();
      for(var i = 0; i < motifs.length; i++) {
        var current = motifs[i], 
            left = 0,
            right = plot.__xCoordMax,
            top = plot.__yCoordMax,
            bottom = 0;

        // Find the outer points.
        for(var j = 0; j < current.nts.length; j++) {
          var id = current['nts'][j],
              elem = Rna2D.utils.element(id);

          if (elem == null) {
            console.log('Missing nt ' + id + ' in motif: ', current);
            break;
          }

          var bbox = elem.getBBox();
          if (bbox.x < right) {
            right = bbox.x;
          }
          if (bbox.x + bbox.width > left) {
            left = bbox.x + bbox.width;
          }
          if (bbox.y + bbox.height > bottom) {
            bottom = bbox.y + bbox.height;
          }
          if (bbox.y < top) {
            top = bbox.y;
          }

          current.bounding = [
            { x: left, y: top },
            { x: left, y: bottom },
            { x: right, y: bottom },
            { x: right, y: top }
          ];
        }
      };

      var motifLine = d3.svg.line()
        .x(function(d) { return d.x; })
        .y(function(d) { return d.y; });

      // Draw the motif boxes
      plot.vis.selectAll(plot.motifs.class())
        .data(plot.motifs()).enter().append('svg:path')
        .attr('id', function(data) { return data.id; })
        .attr('class', function(d) { return d.id.split("_")[0]; })
        .classed(plot.motifs.class(), true)
        .attr('data-nts', function(d) { d.nts.join(','); })
        .attr('d', function(d) { return motifLine(d.bounding) + "Z" })
        .attr('visibility', function(d) { return (plot.motifs.visible(d) ? 'visible' : 'hidden') })
        .on('click', plot.motifs.click)
        .on('mouseover', plot.motifs.mouseover)
        .on('mouseout', plot.motifs.mouseout);

     return plot;
  };

  plot.groups = my;

  plot.motifs.toggle = function() {

  };

  return Rna2D;
}
