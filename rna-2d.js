var plot2D = function(given) {

  var config = {
    interaction_class: 'interaction',
    nucleotide_class: 'nucleotide',
    brush_class: 'brush',
    box_class: 'nt-box',
    font_size: 8,
    width: 500,
    height: 1000,
    coordinates: {},
    connections: {},
    onBrushClear: Object,
    onBrushUpdate: Object,
    brushEnabled: true,
    onInteractionClick: Object,
    defaultViewableInteractions: function(obj) { return obj.family == 'cWW' },
    almostFlat: 0.04,
    ntRadius: 4,
  };

  for(var key in given) {
    config[key] = given[key];
  }

  var plot = function(selection) {
    selection.call(function(selection) {

      var xCoordMax = d3.max(plot.coordinates, function(d) { return d.x; });
      var yCoordMax = d3.max(plot.coordinates, function(d) { return d.y; });
      var xMax = d3.max([config.width, xCoordMax + 10]);
      var yMax = d3.max([config.height, yCoordMax + 10]);
      var xScale = d3.scale.linear().domain([0, xMax]).range([0, config.width]);
      var yScale = d3.scale.linear().domain([0, yMax]).range([0, config.height]);

      //
      var almostFlat = 0.04;
      var intersectPoint = function(x1, y1, x2, y2, r) {
        var x = x2 - x1;
        var y = y2 - y1;

        //Special case nearly level lines.
        if (x < almostFlat) {
          if (y1 > y2) {
            return { x: x1, y: y1 - r };
          }
          return { x: x1, y: y1 + r };
        };
        if (y < almostFlat) {
          if (x1 > x2) {
            return { x : x1 - r, y: y1 };
          }
          return { x: x1 + r, y: y1 };
        }
        var d = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
        var a = x * r / (d + r);
        var b = Math.sqrt(Math.pow(r, 2) - Math.pow(a, 2));

        // Undo the shifts
        return { x: a + x1, y: b + y1 };
      };

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
      for(var i = 0; i < plot.connections.length; i++) {
        var obj = plot.connections[i];
        var nt1 = plot.utils.element(obj.nt1);
        var nt2 = plot.utils.element(obj.nt2);
        if (nt1 && nt2) {
          var interaction_vis = 'hidden';
          if (config.defaultViewableInteractions(obj)) {
            interaction_vis = 'visible';
          };
          var x1 = xScale(plot.utils.centerOf(obj.nt1));
          var y1 = yScale(plot.utils.verticalCenter(obj.nt1));
          var x2 = xScale(plot.utils.centerOf(obj.nt2));
          var y2 = yScale(plot.utils.verticalCenter(obj.nt2));
          var p1 = intersectPoint(x1, y1, x2, y2, config.ntRadius);
          var p2 = intersectPoint(x2, y2, x1, y1, config.ntRadius);
          interactions.push({
            visibility: interaction_vis,
            family: obj.family,
            id: obj.nt1 + ',' + obj.nt2 + ',' + obj.family,
            'data-nts': obj.nt1 + ',' + obj.nt2,
            x1: p1.x,
            y1: p1.y,
            x2: p2.x,
            y2: p2.y
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

      // Apply a function to each thing matching the selection
      plot.each = function(sel, fn) {
        fn(vis.selectAll(sel));
        return plot;
      };

      // Apply a function to the first something matching the selection
      plot.first = function(sel, fn) {
        fn(vis.select(sel));
        return plot;
      };

      // Get some part of the plot
      plot.selectAll = function(sel) {
        return vis.selectAll(sel);
      }

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

        return {
          // Show the brush
          enable: function() {
            vis.append('g')
              .classed(config.brush_class, true)
              .call(brush);
            config.brushEnabled = true;
            return plot;
          },

          // Hide the brush
          disable: function() {
            vis.selectAll('.' + config.brush_class).remove();
            config.brushEnabled = false;
            return plot;
          },

          // Toggle the brush
          toggle: function() {
            if (config.brushEnabled) {
              return plot.brush.disable();
            };
            return plot.brush.enable();
          }
        };
      }();

      // The built in actions for interactions.
      plot.interactions = function() {
        var all = function(family) {
          if (!arguments.length) {
            return vis.selectAll('.' + config.interaction_class);
          };
          return vis.selectAll('.' + family);
        };

        return {
          all: all,

          each: function(fn) {
            fn(all());
            return plot;
          },

          show: function(family) {
            return all(family).attr('visibility', function(data) {
              data.visibility = 'visible';
              return data.visibility;
            });
          },

          hide: function(family) {
            return all(family).attr('visibility', function(data) {
              data.visibility = 'hidden';
              return data.visibility;
            });
          },

          toggle: function(family) {
            return all(family).attr('visibility', function(data) {
              if (data.visibility == 'visible') {
                data.visibility = 'hidden';
              } else {
                data.visibility = 'visible';
              };
              return data.visibility;
            });
          }
        };
      }();

      // The built in actions for nucleotides.
      plot.nucleotides = function() {
        var all = function() { return vis.selectAll(config.nucleotide_class); };

        return {
          all: all,

          each: function(fn) {
            fn(all());
            return plot;
          }
        };

      }();

    });
  };

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

  for(var key in config) {
    plot[key] = accessor(key);
  }

  plot.utils = {
    element: function(id) { return document.getElementById(id); },
    bbox: function(id) { return plot.utils.element(id).getBBox();},
    widthOf: function(id) { return plot.utils.bbox(id).width; },
    heightOf: function(id) { return plot.utils.bbox(id).height; },
    // rightSide: function(id) { return plot.utils.bbox(id).x + plot.utils.widthOf(id); },
    // leftSide: function(id) { return plot.utils.bbox(id).x; },
    // verticalCenter: function(id) { return plot.utils.bbox(id).y - plot.utils.heightOf(id)/2; },
    // centerOf: function(id) { return plot.utils.bbox(id).x + plot.utils.widthOf(id)/2; },
    verticalCenter: function(id) { return plot.utils.element(id).__data__.y - plot.utils.heightOf(id)/4; },
    centerOf: function(id) { return plot.utils.element(id).__data__.x + plot.utils.widthOf(id)/2; },
    // bottomOf: function(id) { return plot.utils.bbox(id).y },
    // topOf: function(id) { return plot.utils.bottomOf(id) + plot.utils.heightOf(id) }
  }

  return plot;
};
