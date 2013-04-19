Rna2D.views.airport.groups = function(plot) {

  plot.groups = function(standard) {
      // Compute a box around the motif
      var motifs = plot.motifs(),
          i = 0,
          j = 0;

      if (!motifs || !motifs.length) {
        return plot;
      }

      for(i = 0; i < motifs.length; i++) {
        var current = motifs[i],
            left = 0,
            right = plot.__xCoordMax,
            top = plot.__yCoordMax,
            bottom = 0,
            visible = plot.motifs.visible();

        // Mark motif as visible or not
        current.visible = visible(current);
        current.missing = [];

        // Find the outer points.
        var nts = plot.motifs.getNTs()(current);
        for(j = 0; j < nts.length; j++) {
          var id = nts[j],
              elem = Rna2D.utils.element(id);

          if (elem === null) {
            console.log('Missing nt ' + id + ' in motif: ', current);
            current.missing = id;
          } else {
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
          }
        }

        // Store bounding box. It is very odd to get a bounding box that
        // involves the outer edges. In this case we think that we have not
        // actually found the nts so we log this and use a box that cannot
        // be seen. This prevents bugs where we stop drawing boxes too early.
        if (bottom === 0 || left === 0 || right === plot.__xCoordMax || top === plot.__yCoordMax) {
          console.log("Unlikely bounding box found for " + current.id);
          current.bounding = [{x: 0, y: 0}, {x: 0, y: 0}, {x: 0, y: 0}, {x: 0, y: 0}];
        } else {
          current.bounding = [
            { x: left, y: top },
            { x: left, y: bottom },
            { x: right, y: bottom },
            { x: right, y: top }
          ];
        }

      }

      var motifLine = d3.svg.line()
        .x(function(d) { return d.x; })
        .y(function(d) { return d.y; });

      // Draw the motif boxes
      plot.vis.selectAll(plot.motifs['class']())
        .data(plot.motifs()).enter().append('svg:path')
        .call(standard)
        .attr('missing-nts', function(d) { return d.missing.join(' '); })
        .attr('d', function(d) { return motifLine(d.bounding) + "Z"; });

     return plot;
  };

  plot.motifs.highlight(function() {
    var obj = this,
        highlightColor = plot.motifs.highlightColor();
    return plot.motifs.nucleotides(obj).style('stroke', highlightColor(obj));
  });

  plot.motifs.normalize(function() {
    var obj = this;
    return plot.motifs.nucleotides(obj).style('stroke', null);
  });

  return Rna2D;
};

