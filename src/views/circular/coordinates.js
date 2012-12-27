Rna2D.views.circular.coordinates = function(plot) {

  plot.coordinates = function(standard) {

    var margin = 10 * Math.min(plot.margin().left, plot.margin().right),
        outer = plot.width() / 2 - margin,
        inner = outer - plot.pie.width(),
        center = { x: plot.width() / 2, y: plot.height() / 2},
        count = plot.nucleotides().length,
        angleSize = (2*Math.PI - plot.pie.gapSize()) / count,
        halfGap = plot.pie.gapSize() / 2,
        startAngle = function(d, i) { return i * angleSize + halfGap; },
        endAngle = function(d, i) { return (i + 1) * angleSize + halfGap; };

    var arc = d3.svg.arc()
          .outerRadius(outer)
          .innerRadius(inner)
          .startAngle(startAngle)
          .endAngle(endAngle);

    plot.vis.selectAll(plot.nucleotides['class']())
      .append('g')
      .data(plot.nucleotides()).enter().append('svg:path')
      .call(standard)
      .attr('d', arc)
      .attr('transform', 'translate(' + center.x + ',' + center.y + ')')
      .attr('fill', plot.nucleotides.color());

    plot.__ntArc = arc;
    plot.__circleCenter = center;
    // TODO: Fix scales
    var xScale = d3.scale.linear() 
        .domain([0, plot.width()])
        .range([-center.x, center.x + plot.width()]),
      yScale = d3.scale.linear()
        .domain([0, plot.height()])
        .range([-center.x, center.y + plot.height()]);

    plot.xScale(xScale).yScale(yScale);

    return plot;
  };

  plot.nucleotides.highlight(function() {
    var obj = this,
        highlightColor = plot.nucleotides.highlightColor();
    d3.select(obj).style('stroke', highlightColor(obj));

    plot.pie.addLetters()([obj]);

    return plot.nucleotides.interactions(obj)
      .style('stroke', highlightColor(obj));
  });

  plot.nucleotides.normalize(function() {
    var obj = this;
    d3.select(obj).style('stroke', null);
    plot.pie.clearLetters()();
    return plot.nucleotides.interactions(obj)
      .style('stroke', null);
  });

  plot.pie = {};
  var config = {
    width: 10,
    gapSize: 0.2,
    letterClass: 'nucleotide-letter',
    letterID: function(obj) {
      return obj.getAttribute('id') + '-letter';
    },
    letterSize: 20,
    letterPosition: function(obj) {
      var index = plot.nucleotides.indexOf(obj.getAttribute('id')),
          position = plot.__ntArc.centroid(null, index);
      return {
        x: plot.__circleCenter.x + position[0],
        y: plot.__circleCenter.y + position[1]
      };
    },
    addLetters: function(nts) {
      var positionOf = plot.pie.letterPosition(),
          highlightColor = plot.nucleotides.highlightColor();

      plot.vis.selectAll(plot.pie.letterClass())
        .data(nts).enter().append('svg:text')
        .attr('id', plot.pie.letterID())
        .attr('class', plot.pie.letterClass())
        .attr('x', function(d) { return positionOf(d).x; })
        .attr('y', function(d) { return positionOf(d).y; })
        .attr('font-size', plot.pie.letterSize())
        .attr('pointer-events', 'none')
        .text(function(d) { return d.getAttribute('data-sequence'); })
        .attr('fill', function(d) { return highlightColor(d); });

        return plot.pie;
    },
    clearLetters: function() {
      plot.vis.selectAll('.' + plot.pie.letterClass()).remove();
    }
  };
  Rna2D.utils.generateAccessors(plot.pie, config);

  return Rna2D;
};

