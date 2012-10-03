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
    box_class: 'nt-box',
    font_size: 8,
    width: 500,
    height: 1000,
    coordinates: {},
    interactions: {},
    onBrushClear: Object,
    onBrushUpdate: Object,
    brush_enabled: true,
    onInteractionClick: Object
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
      var boxes = {};

      var xCoordMax = d3.max(plot.coordinates, function(d) { return d.x; });
      var yCoordMax = d3.max(plot.coordinates, function(d) { return d.y; });
      var xMax = d3.max([config.width, xCoordMax + 10]);
      var yMax = d3.max([config.height, yCoordMax + 10]);
      var xScale = d3.scale.linear().domain([0, xMax]).range([0, config.width]);
      var yScale = d3.scale.linear().domain([0, yMax]).range([0, config.height]);

      // Visualization object
      var vis = selection.append('svg')
        .attr('width', config.width)
        .attr('height', config.height);

      // Draw each letter
      vis.selectAll(config.nucleotide)
        .data(plot.coordinates).enter().append('svg:text')
        .attr('id', function(data) { return data['id']; })
        .attr('class', config.nucleotide_class)
        .attr('x', function(data) { return xScale(data['x']); })
        .attr('y', function(data) { return yScale(data['y']); })
        .attr('font-size', config.font_size)
        .text(function(data) { return data['sequence']; });

      // Compute the data to use for interactions
      var interactions = [];
      for(var i = 0; i < plot.interactions.length; i++) {
        var obj = plot.interactions[i];
        var nt1 = plot.utils.element(obj.nt1);
        var nt2 = plot.utils.element(obj.nt2);
        if (nt1 && nt2) {
          var interaction_vis = 'hidden';
          if (obj.family == 'cWW') {
            interaction_vis = 'visible';
          };
          interactions.push({
            visibility: interaction_vis,
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
        .attr('visibility', function(data) { return data.visibility; })
        .on('click', function(d) {
          if (d.visibility == 'visible') {
            config.onInteractionClick(d);
          };
        });

      // Create a brush for selecting
      plot.brush = function() {
        var matched = {};

        var brush = d3.svg.brush()
          .on('brushstart', startBrush)
          .on('brush', updateBrush)
          .on('brushend', endBrush)
          .x(xScale)
          .y(yScale);

        function startBrush() {
          // Check if click within the bounding box of all nts or interactions.
          // Ugh. Such a pain. Maybe do this later.
          matched = {};
        };

        function updateBrush(p) {
          var e = brush.extent();
          vis.selectAll('.' + config.nucleotide_class)
            .attr("checked", function(d) {
              var inside = e[0][0] <= d.x && d.x <= e[1][0]
                && e[0][1] <= d.y && d.y <= e[1][1];
              if (inside) {
                matched[d.id] = d;
              } else if (matched[d.id]) {
                delete(matched[d.id]);
              };
              return inside;
            });
        };

        function endBrush() {
          if (brush.empty()) {
            vis.selectAll('.' + config.nucleotide_class)
              .attr("checked", false);
            matched = {};
            config.onBrushClear();
          } else {
            config.onBrushUpdate(matched);
          };
        };

        return brush;
      }();

      // Show the brush
      plot.brush.enable = function() {
        vis.append('g')
          .classed(config.brush_class, true)
          .call(plot.brush);
        config.brush_enabled = true;
        return plot;
      };

      // Hide the brush
      plot.brush.disable = function() {
        vis.selectAll('.' + config.brush_class).remove();
        config.brush_enabled = false;
        return plot;
      };

      // Toggle the brush
      plot.brush.toggle = function() {
        if (config.brush_enabled) {
          return plot.brush.disable();
        };
        return plot.brush.enable();
      };


      plot.toggleInteraction = function(family) {
        vis.selectAll('.' + family)
          .attr('visibility', function(data) {
            if (data.visibility == 'visible') {
              data.visibility = 'hidden';
            } else {
              data.visibility = 'visible';
            };
            return data.visibility;
          });
      };

      plot.makeNucleotideBox = function(id, nts) {
        var up = d3.max(nts, function(d) { return plot.utils.topOf(d) });
        var down = d3.max(nts, function(d) { return plot.utils.bottomOf(d) });
        var left = d3.max(nts, function(d) { return plot.utils.leftSide(d); });
        var right = d3.max(nts, function(d) { return plot.utils.rightSide(d); });
        vis.append('rect')
          .attr('id', id)
          .attr('class', config.box_class)
          .attr('x', down + 10)
          .attr('y', left + 10)
          .attr('width', right - left + 10)
          .attr('height', up - down + 10)
          .attr('rx', 20)
          .attr('ry', 20);
        boxes[id] = nts;
        return plot;
      };

      plot.deleteNucleotideBox = function(id) {
        delete(boxes[id]);
        return plot;
      };

      plot.toggleNucleotideBox = function(id, nts) {
        if (boxes[id]) {
          return plot.deleteNucleotideBox(id);
        }
        return plot.makeNucleotideBox(id, nts);
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
    centerOf: function(id) { return plot.utils.bbox(id).x + plot.utils.widthOf(id)/2; },
    bottomOf: function(id) { return plot.utils.bbox(id).y },
    topOf: function(id) { return plot.utils.bottomOf(id) + plot.utils.heightOf(id) }
  }

  return plot;
};
