Rna2D.views.airport.groups = function(plot) {

  plot.groups = function() {
      // Compute a box around the motif
      var motifs = plot.motifs();
      for(var i = 0; i < motifs.length; i++) {
        var current = motifs[i], 
            left = 0,
            right = plot.__xCoordMax,
            top = plot.__yCoordMax,
            bottom = 0,
            visible = plot.motifs.visible();

        // Mark motif as visible or not
        current.visible = visible(current);

        // Find the outer points.
        var nts = plot.motifs.getNTs()(current);
        for(var j = 0; j < nts.length; j++) {
          var id = nts[j],
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
        .attr('id', plot.motifs.getID())
        .attr('class', plot.motifs.instanceClass())
        .classed(plot.motifs.class(), true)
        .attr('data-nts', function(d) { return plot.motifs.getNTs()(d).join(','); })
        .attr('d', function(d) { return motifLine(d.bounding) + "Z" })
        .attr('visibility', function(d) { return (d.visible ? 'visible' : 'hidden'); })
        .on('click', plot.motifs.click())
        .on('mouseover', plot.motifs.mouseover())
        .on('mouseout', plot.motifs.mouseout());

     return plot;
  };

  plot.motifs.all = function(family) {
    if (!arguments.length || !family) family = plot.motifs.class();
    return plot.vis.selectAll('.' + family);
  };

  plot.motifs.nucleotides = function(obj) {
    var nts = obj.getAttribute('data-nts').split(',');
    var selector = '#' + nts.join(', #');
    return d3.selectAll(selector);
  };

  plot.motifs.show = function(family) {
    return plot.motifs.all(family)
      .attr('visibility', function(d) {
        d.visible = true;
        return 'visible';
      });
  };

  plot.motifs.hide = function(family) {
    return plot.motifs.all(family)
      .attr('visibility', function(d) {
        d.visible = false;
        return 'hidden';
      });
  };

  plot.motifs.toggle = function(family) {
    return plot.motifs.all(family)
      .attr('visibility', function(d) {
        d.visible = !d.visible;
        if (d.visible == false) {
          return 'hidden';
        };
        return 'visible';
      });
  };

  plot.motifs.highlight = function() {
    var obj = this;
    return plot.motifs.nucleotides(obj).style('stroke', plot.motifs.highlightColor());
  };

  plot.motifs.normalize = function() {
    var obj = this;
    return plot.motifs.nucleotides(obj).style('stroke', null);
  };

  return Rna2D;
}

