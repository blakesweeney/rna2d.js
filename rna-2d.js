var plot2D = function(given) {

  var selection;
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

  var plot = function(select) {
    selection = select;
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

      // Draw the interactions
      vis.selectAll(config.int)
        .data(plot.interactions)
        .enter().append('svg:line')
        .attr('x1', function(data, i) { return (data ? plot.utils.rightSide(data.nt1) : null); })
        .attr('y1', function(data, i) { return (data ? plot.utils.verticalCenter(data.nt1) : null); })
        .attr('x2', function(data, i) { return (data ? plot.utils.leftSide(data.nt2) : null); })
        .attr('y2', function(data, i) { return (data ? plot.utils.verticalCenter(data.nt2) : null); })
        .attr('id', function(data, i) { return (data ? data.nt1 + ',' + data.nt2 : null) })
        .attr('stroke', 'black')
        .attr('stroke-width', config.interaction_width)
        .attr('opacity', 1)
        .attr('class', function(d) { return (d ? ['interaction', d['fr3d']['family']] : []); });


      // Create a brush for selecting
      plot.brush = function() {
        var yScale = d3.scale.linear().domain([0, config.height]).range([0, config.height]);
        var xScale = d3.scale.linear().domain([0, config.width]).range([0, config.width])

        var brush = d3.svg.brush()
          .on('brush', updateBrush)
          .on('brushend', brushend)
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

        function brushend() {
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
          .selectAll('rect')
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
    bbox: function(id) { return plot.utils.element(id).getBBox(); },
    widthOf: function(id) { return plot.utils.bbox(id).width; },
    heightOf: function(id) { return plot.utils.bbox(id).height; },
    rightSide: function(id) { return indexed[id]['x'] + widthOf(id); },
    leftSide: function(id) { return indexed[id]['x']; },
    verticalCenter: function(id) { return indexed[id]['y'] - heightOf(id)/4; }
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
