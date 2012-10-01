var plot2D = function(given) {

  var config = {
    interaction_class: 'interaction',
    nucleotide_class: 'nucleotide',
    width: 500,
    height: 1000,
    font_size: 8,
    interaction_width: 2,
    coordinates: {},
    interactions: {}
  };

  for(key in given) {
    config[key] = given[key];
  }

  var plot = function(selection) {
    selection.call(function(selection) {

      // Simple x and y scales for the brush
      var yScale = d3.scale.linear().domain([0, config.height]).range([0, config.height]);
      var xScale = d3.scale.linear().domain([0, config.width]).range([0, config.width])

      // Visualization object
      var vis = selection.append('svg')
        .attr('width', config.width)
        .attr('height', config.height);

      // Draw each letter
      vis.selectAll(config.nucleotide)
        .data(plot.coordinates).enter().append('svg:text')
        .attr('id', function(data) { return data['id']; })
        .attr('class', config.nucleotide_class)
        .attr('data-coord', function(data) { return data['id']; })
        .attr('x', function(data) { return data['x']; })
        .attr('y', function(data) { return data['y']; })
        .attr('font-size', config.font_size)
        .text(function(data) { return data['sequence']; });

      // Create a brush for selecting
      var brush = d3.svg.brush()
        .on('brushstart', brushstart)
        .on('brush', updateBrush)
        .on('brushend', brushend)
        .x(xScale)
        .y(yScale);

      function brushstart(p) {
        if (brush.data !== p) {
          console.log('setting');
          vis.call(brush.clear());
          brush.x(x[p.x]).y(y[p.y]).data = p;
        }
      }

      function updateBrush(p) {
        var e = brush.extent();
        var matched = [];
        vis.selectAll('.' + config.nucleotide_class)
          .attr("checked", function(d) {
            var inside = e[0][0] <= d.x && d.x <= e[1][0]
              && e[0][1] <= d.y && d.y <= e[1][1];
            if (inside) {
              matched.push(d);
            };
            return inside;
          });
      };

      function brushend() {
        if (brush.empty()) {
          vis.selectAll('.' + config.nucleotide_class)
            .attr("checked", false);
        };
      };

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

      vis.call(brush);
    });
  };

  plot.utils = {
    element: function(id) { return document.getElementById(id); },
    bbox: function(id) { return plot.utils.element(id).getBBox(); },
    widthOf: function(id) { return plot.utils.bbox(id).width; },
    heightOf: function(id) { return plot.utils.bbox(id).height; },
    rightSide: function(id) { return indexed[id]['x'] + widthOf(id); },
    leftSide: function(id) { return indexed[id]['x']; },
    verticalCenter: function(id) { return indexed[id]['y'] - heightOf(id)/4; }
    // interactionOf: function(data) { return data['fr3d']['family'] }
  }

  // Function to build generic config accessors
  var accessor = function(name) {
    return function(value) {
      if (!arguments.length) {
        return plot.config[name];
      };
      plot[name] = value;
      return plot;
    };
  };

  plot.coordinates = accessor('coordinates');
  plot.interactions = accessor('interactions');

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
