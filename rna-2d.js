var plot2D = function(given) {

  var merge = function(update, old) {
    for(var key in old) {
      var val = old[key];
      if (typeof(val) == 'object') {
        update[key]  = merge(update[key] || {}, val);
      } else {
        update[key] = val;
      }
    }
    return update;
  };

  var config = {
    nucleotide: {
      gap: 1,
      highlight: 'red',
      'class': 'nucleotide',
      on: {
        mouseover: Object,
        mouseout: Object
      }
    },
    font_size: 8,
    width: 500,
    height: 1000,
    coordinates: {},
    connections: {},
    groups: {},
    brush: {
      'class': 'brush',
      enabled: true,
      initial: null,
      on: {
        clear: Object,
        update: Object
      }
    },
    interaction: {
      'class': 'interaction',
      visible: function(obj) { return obj.family == 'cWW' },
      log_missing: false,
      highlight: 'red',
      on: {
        click: Object,
        mouseover: Object,
        mouseout: Object,
      }
    },
    almostFlat: 0.004,
    margin: {
      left: 10,
      right: 10,
      above: 10,
      below: 10
    },
    frame: {
      add: true,
      'class': 'frame'
    },
    motif: {
      'class': 'motif',
      visible: 'hidden',
      highlight: 'red',
      on: {
        click: Object,
        mouseover: Object,
        mouseout: Object,
      },
    },
  };

  config = merge(config, given);

  var plot = function(selection) {

    selection.call(function(selection) {

      var xCoordMax = d3.max(plot.coordinates, function(d) { return d.x; });
      var yCoordMax = d3.max(plot.coordinates, function(d) { return d.y; });
      var xMax = d3.max([config.width, xCoordMax]);
      var yMax = d3.max([config.height, yCoordMax]);
      var xScale = d3.scale.linear().domain([-config.margin.right, xMax + config.margin.left])
        .range([0, config.width]);
      var yScale = d3.scale.linear().domain([-config.margin.above, yMax + config.margin.below])
        .range([0, config.height]);

      // We need to track if we are drawing across the letter in which case we
      // need to use the width + raidus, otherwise we just need to use the
      // radius.
      // The bounding box is the upper left of the objects.
      var intersectPoint = function(obj1, obj2, r) {
        var bbox1 = obj1.getBBox();
        var bbox2 = obj2.getBBox();
        var x1 = bbox1.x;
        var y1 = bbox1.y
        var x2 = bbox2.x;
        var y2 = bbox2.y
        var dx = x2 - x1;
        var dy = y2 - y1;
        var sign = function(v) { return (v < 0 ? -1 : 1); };
        var centerOf = function(bbox) { return { x: bbox.x + bbox.width/2, y: bbox.y + bbox.height/2 }; };
        var dist = function(x, y) { return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)); };

        // Special case lines that are horizontal
        if (Math.abs(dy) < config.almostFlat) {
          y1 = y1 + bbox1.height/2;
          if (x1 < x2) {
            return { x: x1 + bbox1.width + r, y: y1 };
          }
          return { x : x1 - r, y: y1 };
        }

        // Special case lines that are vertical
        if (Math.abs(dx) < config.almostFlat) {
          x1 = x1 + bbox1.width/2;
          if (y1 > y2) {
            return { x: x1, y: y1 + r };
          }
          return { x: x1, y: y1 + bbox1.height + r};
        };
        var c = centerOf(bbox1);

        // All other lines
        r = 1;
        // r = bbox1.width/2;
        var d = dist(dx, dy);
        // r = dist(bbox1.width/2, bbox1.height/2);
        var a = sign(dx) * Math.abs(dx * r / d);
        var b = sign(dy) * dist(r, a);
        // return { x: c.x, y: c.y };
        return { x: c.x + a, y: c.y + b };
      };

      // Visualization object
      var vis = selection.append('svg')
        .attr('width', config.width)
        .attr('height', config.height);

      // Draw a frame around the plot
      if (config.frame.add) {
        vis.append('svg:rect')
          .classed(config.frame['class'], true)
          .attr('x', 0)
          .attr('y', 0)
          .attr('width', config.width)
          .attr('height', config.height - 1);
      }

      // Draw each letter
      vis.selectAll(config.nucleotide.class)
        .data(plot.coordinates).enter().append('svg:text')
        .attr('id', function(data) { return data['id']; })
        .attr('class', config.nucleotide['class'])
        .attr('x', function(data) { return xScale(data['x']); })
        .attr('y', function(data) { return yScale(data['y']); })
        .attr('font-size', config.font_size)
        .text(function(data) { return data['sequence']; })
        .on('mouseover', function() { return config.nucleotide.on.mouseover(this); })
        .on('mouseout', function() { return config.nucleotide.on.mouseout(this); })

      // Compute the data to use for interactions
      var interactions = [];
      for(var i = 0; i < plot.connections.length; i++) {
        var obj = plot.connections[i];
        var nt1 = plot.utils.element(obj.nt1);
        var nt2 = plot.utils.element(obj.nt2);
        if (nt1 && nt2) {
          var interaction_vis = 'hidden';
          if (config.interaction.visible(obj)) {
            interaction_vis = 'visible';
          };
          var p1 = intersectPoint(nt1, nt2, config.nucleotide.gap);
          var p2 = intersectPoint(nt2, nt1, config.nucleotide.gap);
          interactions.push({
            visibility: interaction_vis,
            family: obj.family,
            id: obj.nt1 + ',' + obj.nt2 + ',' + obj.family,
            'data-nts': obj.nt1 + ',' + obj.nt2,
            'nt1': obj.nt1,
            'nt2': obj.nt2,
            x1: p1.x,
            y1: p1.y,
            x2: p2.x,
            y2: p2.y
          });
        } else {
          if (config.interaction.log_missing) {
            console.log("Could not find both nts in ", obj);
          }
        };
      }

      // Draw the interactions
      vis.selectAll(config.interaction.class)
        .data(interactions)
        .enter().append('svg:line')
        .attr('id', function(data) { return data.id; })
        .attr('class', function(d) { return config.interaction.class + ' ' +  d.family; })
        .attr('x1', function(data) { return data.x1; })
        .attr('y1', function(data) { return data.y1; })
        .attr('x2', function(data) { return data.x2; })
        .attr('y2', function(data) { return data.y2; })
        .attr('visibility', function(data) { return data.visibility; })
        .attr('data-nts', function(data) { return data['data-nts']; })
        .attr('nt1', function(data) { return data.nt1; })
        .attr('nt2', function(data) { return data.nt2; })
        .on('click', config.interaction.on.click)
        .on('mouseover', function() { config.interaction.on.mouseover(this); })
        .on('mouseout', function() { config.interaction.on.mouseout(this) });

      // Compute a box around the motif
      for(var i = 0; i < plot.groups.length; i++) {
        var current = plot.groups[i];
        current['data-nts'] = current.nts.join(',');
        var left = 0;
        var right = xCoordMax;
        var top = yCoordMax;
        var bottom = 0;

        // Find the outer points.
        for(var j = 0; j < current.nts.length; j++) {
          var id = current['nts'][j];
          var elem = plot.utils.element(id);
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
      vis.selectAll(config.motif.class)
        .data(plot.groups).enter().append('svg:path')
        .attr('id', function(data) { return data.id; })
        .attr('class', function(d) { return d.id.split("_")[0]; })
        .classed(config.motif.class, true)
        .attr('data-nts', function(d) { return d.nts; })
        .attr('d', function(d) { return motifLine(d.bounding) + "Z" })
        .attr('visibility', function(data) {
          if (config.motif.visible) {
            return 'visible';
          }
          return 'hidden';
        })
        .on('click', config.motif.on.click)
        .on('mouseover', function() { return config.motif.on.mouseover(this) })
        .on('mouseout', function() { return config.motif.on.mouseout(this) });

      // TODO need to add a mouseover like event that changes the class of the
      // interaction and the assoicated NTs. Use mouseenter and mouseleave to do
      // this

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
          vis.selectAll('.' + config.nucleotide.class)
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
            vis.selectAll('.' + config.nucleotide.class)
              .attr("checked", false);
            matched = {};
            config.brush.on.clear();
          } else {
            config.brush.on.update(matched);
          };
        };

        // TODO: Do this correctly.
        if (config.brush.initial) {
          brush.extent(config.brush.initial);
          startBrush();
          updateBrush();
          endBrush();
        }

        return {
          // Show the brush
          enable: function() {
            vis.append('g')
              .classed(config.brush.class, true)
              .call(brush);
            config.brushEnabled = true;
            return plot;
          },

          // Hide the brush
          disable: function() {
            vis.selectAll('.' + config.brush.class).remove();
            config.brushEnabled = false;
            return plot;
          },

          // Toggle the brush
          toggle: function() {
            if (config.brushEnabled) {
              return plot.brush.disable();
            };
            return plot.brush.enable();
          },
        };
      }();

      if (config.brush.enabled) {
        plot.brush.enable();
      }

      // The built in actions for interactions.
      plot.interactions = function() {
        var all = function(family) {
          if (!arguments.length) {
            return vis.selectAll('.' + config.interaction.class);
          };
          return vis.selectAll('.' + family);
        };

        return {
          nts: function(obj) {
            var nts = obj.getAttribute('data-nts').split(',');
            var selector = '#' + nts.join(', #');
            return d3.selectAll(selector);
          },

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
          },

          highlight: function(obj) {
            d3.select(obj).style('stroke', config.interaction.highlight);
            return plot.interactions.nts(obj).style('stroke', config.interaction.highlight);
          },

          normalize: function(obj) {
            d3.select(obj).style('stroke', null);
            return plot.interactions.nts(obj).style('stroke', null);
          },
        };
      }();

      // The built in actions for nucleotides.
      plot.nucleotides = function() {
        var all = function() { return vis.selectAll('.' + config.nucleotide.class); };

        return {
          interactions: function(obj) {
            var selector = '[nt1=' + obj.getAttribute('id') + '], [nt2=' + obj.getAttribute('id') + ']';
            return d3.selectAll(selector);
          },

          all: all,

          each: function(fn) {
            fn(all());
            return plot;
          },

          highlight: function(obj) {
            d3.select(obj).style('stroke', config.nucleotide.highlight);
            return plot.nucleotides.interactions(obj).style('stroke', config.nucleotide.highlight);
          },

          normalize: function(obj) {
            d3.select(obj).style('stroke', null);
            return plot.nucleotides.interactions(obj).style('stroke', null);
          },
        };

      }();

      // Controls for motifs
      plot.motifs = function() {
        var all = function() { return vis.selectAll('.' + config.motif.class); };

        return {
          nts: function(obj) {
            var nts = obj.getAttribute('data-nts').split(',');
            var selector = '#' + nts.join(', #');
            return d3.selectAll(selector);
          },

          all: all,

          each: function(fn) {
            fn(all());
            return plot;
          },

          show: function() {
            config.motif.visible = true;
            return all().attr('visibility', 'visible');
          },

          hide: function() {
            config.motif.visible = false;
            return all().attr('visibility', 'hidden');
          },

          toggle: function() {
            if (config.motif.visible) {
              return plot.motifs.hide();
            };
            return plot.motifs.show();
          },

          highlight: function(obj) {
            return plot.motifs.nts(obj).style('stroke', config.motif.highlight);
          },

          normalize: function(obj) {
            return plot.motifs.nts(obj).style('stroke', null);
          },

        };
      }();

      if (config.interaction.on.mouseover == 'highlight') {
        config.interaction.on.mouseover = plot.interactions.highlight;
        config.interaction.on.mouseout = plot.interactions.normalize;
      };

      if (config.nucleotide.on.mouseover == 'highlight') {
        config.nucleotide.on.mouseover = plot.nucleotides.highlight;
        config.nucleotide.on.mouseout = plot.nucleotides.normalize;
      };

      if (config.motif.on.mouseover == 'highlight') {
        config.motif.on.mouseover = plot.motifs.highlight;
        config.motif.on.mouseout = plot.motifs.normalize;
      };

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

   plot.coordinates = accessor('coordinates');
   plot.connections = accessor('connections');
   plot.groups = accessor('groups');

  plot.utils = function() {
    var element = function(id) { return document.getElementById(id); };
    return {
      element: element
    };
  }();

  return plot;
};
