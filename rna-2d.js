var plot2D = function(given) {

  // See http://mathworld.wolfram.com/Circle-LineIntersection.html
  // var circleLineIntersection = function(p1, p2) {
  //   var dx = p2.x - p1.x;
  //   var dy = p2.y - p1.y;
  //   var dr = sqrt(dx^2 - dy^2);
  //   var D = p1.x * p2.y - p2.x * p1.y;
  //   var sign = function(v) { return v < 0 ? -1 : 1 };
  //   var x = D * dy + sign(dy) * dx * 
  // };

  var config = {
    interaction_class: 'interaction',
    nucleotide_class: 'nucleotide',
    brush_class: 'brush',
    width: 500,
    height: 1000,
    font_size: 8,
    interaction_width: 2,
    coordinates: {},
    interactions: {},
    onBrushClear: Object,
    onBrushUpdate: Object
  };

  for(var key in given) {
    config[key] = given[key];
  }

  // Function to build generic config accessors
  var accessor = function(name) {
    return function(value) {
      if (!arguments.length) {
        return config[name];
      };
      plot[name] = value;
      return plot;
    };
  };

  var plot = function(selection) {
    selection.call(function(selection) {

      // Visualization object
      var vis = selection.append('svg')
        .attr('width', config.width)
        .attr('height', config.height);

      // Draw each letter
      vis.selectAll(config.nucleotide)
        .data(plot.coordinates).enter().append('svg:text')
        .attr('id', function(data) { return data['id']; })
        .attr('class', config.nucleotide_class)
        .attr('x', function(data) { return data['x']; })
        .attr('y', function(data) { return data['y']; })
        .attr('font-size', config.font_size)
        .text(function(data) { return data['sequence']; });

      // Compute the data to use for interactions
      var interactions = [];
      for(var i = 0; i < plot.interactions.length; i++) {
        var obj = plot.interactions[i];
        var nt1 = plot.utils.element(obj.nt1);
        var nt2 = plot.utils.element(obj.nt2);
        if (nt1 && nt2) {
          interactions.push({
            family: obj.family,
            id: obj.nt1 + ',' + obj.nt2 + ',' + obj.family,
            'data-nts': obj.nt1 + ',' + obj.nt2,
            x1: plot.utils.centerOf(obj.nt1),
            y1: plot.utils.verticalCenter(obj.nt1),
            x2: plot.utils.centerOf(obj.nt2),
            y2: plot.utils.verticalCenter(obj.nt2)
          });
        };
      }

      // Draw the interactions
      vis.selectAll(config.interaction_class)
        .data(interactions)
        .enter().append('svg:line')
        .attr('id', function(data) { return data.id; })
        .attr('class', function(d) { return 'interaction ' + d.family; })
        .attr('x1', function(data) { return data.x1; })
        .attr('y1', function(data) { return data.y1; })
        .attr('x2', function(data) { return data.x2; })
        .attr('y2', function(data) { return data.y2; })
        .attr('stroke', 'black')
        .attr('stroke-width', 2)
        .attr('opacity', 1)
        ;

      // Create a brush for selecting
      plot.brush = function() {
        var yScale = d3.scale.linear().domain([0, config.height]).range([0, config.height]);
        var xScale = d3.scale.linear().domain([0, config.width]).range([0, config.width])

        var brush = d3.svg.brush()
          .on('brush', updateBrush)
          .on('brushend', endBrush)
          .x(xScale)
          .y(yScale);

        function updateBrush(p) {
          var e = brush.extent();
          var matched = [];
          vis.selectAll('.' + config.nucleotide_class)
            .attr("checked", function(d) {
              var inside = e[0][0] <= d.x && d.x <= e[1][0]
                && e[0][1] <= d.y && d.y <= e[1][1];
              if (inside) {
                matched.push(d.id);
              };
              return inside;
            });
          config.onBrushUpdate(matched);
        };

        function endBrush() {
          if (brush.empty()) {
            vis.selectAll('.' + config.nucleotide_class)
              .attr("checked", false);
            config.onBrushClear();
          };
        };

        return brush;
      }();

      // Show the brush
      plot.brush.enable = function() {
        vis.call(plot.brush)
          .selectAll('.extent')
          .classed(config.brush_class, true);
        return plot;
      };

      // Hide the brush
      plot.brush.disable = function() {
        vis.call(plot.brush)
          .selectAll('rect')
          .remove();
        return plot;
      };
    });
  };

  for(var key in config) {
    plot[key] = accessor(key);
  }

  plot.utils = {
    element: function(id) { return document.getElementById(id); },
    bbox: function(id) { return plot.utils.element(id).getBBox();},
    widthOf: function(id) { return plot.utils.bbox(id).width; },
    heightOf: function(id) { return plot.utils.bbox(id).height; },
    rightSide: function(id) { return plot.utils.bbox(id).x + plot.utils.widthOf(id); },
    leftSide: function(id) { return plot.utils.bbox(id).x; },
    verticalCenter: function(id) { return plot.utils.bbox(id).y - plot.utils.heightOf(id)/4; },
    centerOf: function(id) { return plot.utils.bbox(id).x + plot.utils.widthOf(id)/2; }
  }

  plot.showOnlyInteractions = function(type) {
    var selector = function(data) { return interactionOf(data) == type; };
    if (typeof(type) == 'function') {
      selector = type;
    };

    vis.selectAll(config.interaction_class)
      .filter(selector)
      .attr('visibility', 'visibile');

    vis.selectAll(config.interaction_class)
      .filter(function(data) { return !selector(data) })
      .attr('visibility', 'hidden');

    return plot;
  };

  return plot;
};
