(function() {
  'use strict';

var Rna2D = window.Rna2D || function(config) {
  var plot = function(selection) {

    // Set the selection to the given one.
    if (selection) {
      plot.selection(selection);
    }

    // Setup the view
    var view = Rna2D.views[plot.view()];
    view.coordinates(plot);
    view.connections(plot);
    view.groups(plot);

    d3.select(plot.selection()).call(function(sel) {

      // Compute the nucleotide ordering. This is often used when drawing
      // interactions.
      plot.nucleotides.computeOrder();

      sel.select('svg').remove();
      plot.vis = sel.append('svg')
        .attr('width', plot.width())
        .attr('height', plot.height());

      // ----------------------------------------------------------------------
      // Draw all coordinates and attach all standard data
      // ----------------------------------------------------------------------
      plot.coordinates(function(selection) {

        selection.attr('id', plot.nucleotides.getID())
          .attr('class', function(d, i) {
            return plot.nucleotides['class']() + ' ' + plot.nucleotides.classOf()(d, i);
          })
          .attr('data-sequence', plot.nucleotides.getSequence());

        Rna2D.utils.attachHandlers(selection, plot.nucleotides);

        return selection;
      });

      // ----------------------------------------------------------------------
      // Draw all interactions and add all common data
      // ----------------------------------------------------------------------
      plot.connections(function(selection) {
        var ntsOf = plot.interactions.getNTs(),
            visible = plot.interactions.visible();

        selection.attr('id', plot.interactions.getID())
          .attr('class', function(d, i) {
            return plot.interactions['class']() + ' ' + plot.interactions.classOf()(d, i);
          })
          .attr('visibility', function(d) {
                d.__visibility = visible(d);
                return (visible(d) ? 'visible' : 'hidden'); 
          })
          .attr('data-nts', function(d, i) { return ntsOf(d).join(','); })
          .attr('nt1', function(d, i) { return ntsOf(d)[0]; })
          .attr('nt2', function(d, i) { return ntsOf(d)[1]; });

        Rna2D.utils.attachHandlers(selection, plot.interactions);

        return selection;
      });

      // ----------------------------------------------------------------------
      // Draw motifs
      // ----------------------------------------------------------------------
      plot.groups(function(selection) {
        var ntsOf = plot.motifs.getNTs();

        selection.attr('id', plot.motifs.getID())
          .attr('class', function(d, i) {
            return plot.motifs['class']() + ' ' + plot.motifs.classOf()(d, i);
          })
          .attr('data-nts', function(d) { return plot.motifs.getNTs()(d).join(','); })
          .datum(function(d, i) {
            d.__visible = plot.motifs.visible()(d, i);
            return d;
          }).attr('visibility', function(d) { return (d.__visible ? 'visible' : 'hidden'); });

        Rna2D.utils.attachHandlers(selection, plot.motifs);

        return selection;
      });

      // Generate the components - brush, frame, zoom, etc
      plot.components();

      return plot;
    });
  };

  // Configure the plot
  Rna2D.config(plot, config);

  // Add all components.
  Rna2D.components(plot);

  return plot;
};

window.Rna2D = Rna2D;

Rna2D.components = function(plot) {

  plot.components = function() {
    for(var name in plot.components) {
      plot.components[name](plot);
    }
  };

  for(var name in Rna2D.components) {
    var obj = Rna2D.components[name];

    (function(name) {
      var data = null;
      plot[name] = function(x) {
        if (!arguments.length) {
          return data;
        }
        data = x;
        return plot[name];
      };
    })(name);

    if (typeof(obj.config) === "function") {
      obj.config = obj.config(plot);
    }
    Rna2D.utils.generateAccessors(plot[name], obj.config);

    if ('sideffects' in obj) {
      obj.sideffects(plot);
    }
  }

  plot.components[name] = function(plot) {
    for(var name in Rna2D.components) {
      var obj = Rna2D.components[name];

      if ('actions' in obj) {
        obj.actions(plot);
      }

      if ('generate' in obj) {
        obj.generate(plot);
      }
    }

    return plot;
  };

  return Rna2D;
};

Rna2D.config = function(plot, given) {

  var config = { 
    labels: [],
    margin: { left: 10, right: 10, above: 10, below: 10 },
    view: 'circular',
    width:  500,
    height: 1000,
    selection: null,
    xScale: null,
    yScale: null
  };

  Rna2D.utils.extend(config, given);
  Rna2D.utils.generateAccessors(plot, config);

  return plot;
};

Rna2D.utils = function() {
  var my = {};

  my.distance = function(a, b) {
    return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
  };

  my.generateAccessors = function(obj, state, callback) {
    d3.keys(state).forEach(function(key) {

      obj[key] = function() {
        return function(x) {
          if (!arguments.length) {
            return state[key];
          }
          var old = state[key];
          state[key] = x;
          if (callback && callback[key]) {
            callback[key](old, x);
          }
          return obj;
        };
      }();

    });
  };

  my.attachHandlers = function(selection, obj) {
    var handlers = ['click', 'mouseover', 'mouseout'];

    if (obj.mouseover() === 'highlight') {
      handlers = [handlers[0]];
      selection.on('mouseover', obj.highlight())
        .on('mouseout', obj.normalize());
    }

    handlers.forEach(function(handler) {
      if (obj[handler]) {
        selection.on(handler, obj[handler]());
      }
    });

    return selection;
  };

  my.extend = function(update, old) {
    for(var key in old) {
      update[key] = old[key];
    }
    return update;
  };

  my.element = function(id) {
    return document.getElementById(id);
  };

  return my;
}();

// TODO: Organize so we don't have to add this silly setup.
// Some builtin views.
Rna2D.views = { 
  airport: {},
  circular: {}
};

Rna2D.components.brush = function() {

  var startBrush, updateBrush, endBrush;

  return {

    config: {
      enabled: true,
      initial: [],
      'class': 'brush',
      update: Object,
      clear: Object
    },

    actions: function(plot) {
      // Draw the brush around the given extent
      plot.brush.select = function(extent) {
        startBrush();
        plot.brush().extent(extent);
        updateBrush();
        plot.vis.select('.' + plot.brush['class']())
          .call(plot.brush());
        endBrush();
        return plot.brush;
      };

      // Show the brush
      plot.brush.enable = function() {
        plot.vis.append('g')
          .classed(plot.brush['class'](), true)
          .call(plot.brush());
        plot.brush.enabled(true);
        return plot.brush;
      };

      // Hide the brush
      plot.brush.disable = function() {
        plot.vis.selectAll('.' + plot.brush['class']()).remove();
        plot.brush.enabled(false);
        return plot.brush;
      };

      // Toggle the brush
      plot.brush.toggle = function() {
        if (plot.brush.enabled()) {
          return plot.brush.disable();
        }
        return plot.brush.enable();
      };
    },

    generate: function(plot) {

    // Blank for now, later may use this for a multiple selecting brush.
    startBrush = function () { return 'bobo'; };

    // Do nothing for now.
    updateBrush = function (p) { };

    endBrush = function () {
      var matched = {};

      if (plot.brush().empty()) {
        plot.brush.clear();
      } else {

        var e = plot.brush().extent(),
            getID = plot.nucleotides.getID();
        plot.vis.selectAll('.' + plot.nucleotides['class']())
          .attr("checked", function(d) {
            if (e[0][0] <= d.__x && d.__x <= e[1][0] &&
                e[0][1] <= d.__y && d.__y <= e[1][1]) {
              matched[getID(d)] = d;
            }
          });

        plot.brush.update()(matched);
      }
    };
      plot.brush(d3.svg.brush()
        .on('brushstart', startBrush)
        .on('brush', updateBrush)
        .on('brushend', endBrush)
        .x(plot.xScale())
        .y(plot.yScale()));

      if (plot.brush.initial().length) {
        plot.brush.select(plot.brush.initial());
      }

      if (plot.brush.enabled()) {
        plot.brush.enable();
      }

      return plot.brush;
    }
  };

}();

Rna2D.components.frame = {

  config: {
    add: true,
    'class': 'frame'
  },

  generate: function(plot) {

    if (!plot.frame.add()) {
      return plot.vis;
    }

    return plot.vis.append('svg:rect')
      .classed(plot.frame['class'](), true)
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', plot.width())
      .attr('height', plot.height() - 1)
      .style('pointer-events', 'none');
  }
};

Rna2D.components.interactions = function () {

  return {

    config: function(plot) {
      return {
        getFamily: function(d) { return d.family; },
        getNTs: function(d) { return [d.nt1, d.nt2]; },
        visible: function(d) { 
          var family = plot.interactions.getFamily()(d);
          return family === 'cWW' || family === 'ncWW'; 
        },
        mouseover: null,
        mouseout: null,
        click: null,
        'class': 'interaction',
        classOf: function(d) { return d.family; },
        highlightColor: function() { return 'red'; },
        highlight: Object,
        normalize: Object,
        isForward: function(d) {
          var getFamily = plot.interactions.getFamily(),
              family = getFamily(d);
          if (family.length == 3) {
            family = family.slice(1, 3).toUpperCase();
          } else {
            family = family.slice(2, 4).toUpperCase();
          }
          return family == 'WW' || family == 'WH' || family == 'WS' ||
                 family == 'HH' || family == 'SH' || family == 'SS';
        },
        isSymmetric: function(d, i) {
          var getFamily = plot.interactions.getFamily(),
              family = getFamily(d);
          return family[1] == family[2];
        },
        getID: function(d) {
          var family = plot.interactions.getFamily()(d),
              nts = plot.interactions.getNTs()(d);
          if (plot.interactions.isSymmetric()(d)) {
            nts.sort();
          }
          nts.push(family);
          return nts.join('-');
        },
        color: 'black'
      };
    },

    sideffects: function(plot) {
      // An interaction is valid if it is in the forward direction, it is not a
      // duplicate, and it has nucleotides which have been indexed. Interactions
      // are duplicate if their ID is the same.
      plot.interactions.valid = function() {
        var interactions = plot.interactions(),
            getID = plot.interactions.getID(),
            getNts = plot.interactions.getNTs(),
            isForward = plot.interactions.isForward(),
            valid = [],
            seen = {},
            orderedNts = plot.nucleotides.ordered();

        for(var i = 0; i < interactions.length; i++) {
          var current = interactions[i],
              id = getID(current, i),
              nts = getNts(current);

          if (isForward(current) && !seen[id] && nts.length &&
              orderedNts[nts[0]] && orderedNts[nts[1]]) {
            seen[id] = true;
            valid.push(current);
          }
        }

        return valid;
      };
    },

    actions: function(plot) {


      plot.interactions.all = function(family) {
        if (!arguments.length || !family) {
          family = plot.interactions['class']();
        }
        return plot.vis.selectAll('.' + family);
      };

      plot.interactions.family = function(obj) {
        return plot.interactions.getFamily()(d3.select(obj).datum());
      };

      plot.interactions.nucleotides = function(obj) {
        if (!arguments.length) {
          obj = this;
        }
        var nts = obj.getAttribute('data-nts').split(','),
            selector = '#' + nts.join(', #');
        return plot.vis.selectAll(selector);
      };

      plot.interactions.show = function(family) {
        return plot.interactions.all(family).attr('visibility', function(data) {
          data.__visibility = true;
          return 'visible';
        });
      };

      plot.interactions.hide = function(family) {
        return plot.interactions.all(family).attr('visibility', function(data) {
          data.__visibility = false;
          return 'hidden';
        });
      };

      plot.interactions.toggle = function(family) {
        return plot.interactions.all(family).attr('visibility', function(data) {
          if (data.__visibility) {
            data.__visibility = false;
            return 'hidden';
          }
          data.__visibility = true;
          return 'visible';
        });
      };
    }
  };

}();

Rna2D.components.jmol = {

  config: {
    divID: 'jmol',
    appID: 'jmolApplet0',
    tmpID: 'tempJmolToolsObj',
    neighborhoodID: 'neighborhood',
    numbersID: 'showNtNums',
    stereoID: 'stero',
    maxSize: 200,
    overflow: Object,
    windowSize: 400,
    windowBuild: function($div) {
      $div.append('<label><input type="checkbox" id="showNtNums">Numbers</label>')
        .append('<input type="button" id="neighborhood" value="Show neighborhood">')
        .append('<input type="button" id="stereo" value="Stereo">');
    }
  },

  sideffects: function(plot) {
    plot.jmol.setup = function() {
      var $app = $('#' + plot.jmol.appID()),
          $div = $('#' + plot.jmol.divID());

      // launch jmol if necessary
      if ($app.length === 0 ) {
        $div.html(jmolApplet(plot.jmol.windowSize(), "", 0));
        plot.jmol.windowBuild()($div);
        $div.show();
      }

      // reset the state of the system
      jmolScript('zap;');
      $.jmolTools.numModels = 0;
      $.jmolTools.stereo = false;
      $.jmolTools.neighborhood = false;
      $('#' + plot.jmol.neighborhoodID()).val('Show neighborhood');
      $.jmolTools.models = {};

      // unbind all events
      $('#' + plot.jmol.stereoID()).unbind();
      $('#' + plot.jmol.neighborhoodID()).unbind();
      $('#' + plot.jmol.numbersID()).unbind();

      return plot.jmol;
    };

    // Display a selection.
    plot.jmol.showSelection = function(matched) {
      plot.jmol.setup();

      var data = matched;
      if (typeof(matched) == 'object') {
        var ids = $.map(matched, function(value, key) { return key; });
        data = ids.join(',');
      }

      var count = data.split(',').length;
      if (count > plot.jmol.maxSize()) {
        return plot.jmol.overflow();
      }

      $('#' + plot.jmol.tmpID()).remove();
      $('body').append("<input type='radio' id='" + plot.jmol.tmpID() +
                       "' data-coord='" + data + "'>");
      $('#' + plot.jmol.tmpID()).hide();
      $('#' + plot.jmol.tmpID()).jmolTools({
        showNeighborhoodId: plot.jmol.neighborhoodID(),
        showNumbersId: plot.jmol.numbersID(),
        showStereoId: plot.jmol.stereoID()
      }).jmolToggle();

      return plot.jmol;
    };

    // Show the given group. The group should have a data-nts property which is
    // a string of nt ids to show.
    plot.jmol.showGroup = function(group) {
      if (!arguments.length || !group) {
        group = this;
      }
      plot.jmol.showSelection(group.getAttribute('data-nts'));
    };

  }

};

Rna2D.components.labels = {
  config: {
    majorTickClass: 'major-tick',
    minorTickClass: 'minor-tick',
    labelClass: 'label',
    width: 5,
    fontSize: 12,
    majorTickCount: 30,
    majorTickGenerator: function(length) {
      var scale = d3.scale.identity()
        .domain([1, plot.nucleotides().length + 1])
        .range([1, plot.nucleotides().length + 1]);
      return scale.ticks(plot.labels.majorTickCount());
    },
    minorTickCount: 150,
    minorTickGenerator: function(length) {
      var scale = d3.scale.identity()
        .domain([1, plot.nucleotides().length + 1])
        .range([1, plot.nucleotides().length + 1]);
      return scale.ticks(plot.labels.minorTickCount());
    }
  }
};

Rna2D.components.motifs = function () {

  return {

    config: {
      classOf: function(d) { return d.id.split("_")[0]; },
      'class': 'motif',
      highlightColor: function() { return 'red'; },
      visible: function(d) { return true; },
      click: null,
      mouseover: null,
      mouseout: null,
      getID: function(d) { return d.id; },
      getNTs: function(d) { return d.nts; },
      highlight: Object,
      normalize: Object
    },

    actions: function(plot) {
      plot.motifs.all = function() {
        return plot.vis.selectAll('.' + plot.motifs['class']());
      };

      plot.motifs.nucleotides = function(obj) {
        var nts = obj.getAttribute('data-nts').split(',');
        var selector = '#' + nts.join(', #');
        return plot.vis.selectAll(selector);
      };

      plot.motifs.show = function() { 
        var visible = plot.motifs.visible();
        return plot.motifs.all().datum(function(d, i) {
          d.__visible = visible(d, i);
          return d;
        }).attr('visibility', function(d, i) {
          return (d.__visible ?  'visible' : 'hidden');
        });
      };

      plot.motifs.hide = function() {
        var visible = plot.motifs.visible();
        return plot.motifs.all().datum(function(d, i) {
          d.__visible = visible(d, i);
          return d;
        }).attr('visibility', function(d, i) {
          return (d.__visible ? 'hidden' : 'visible');
        });
      };

      plot.motifs.toggle = function() {
        var visible = plot.motifs.visible();
        plot.motifs.all().datum(function(d, i) {
          d.__visible = !d.__visible;
          return d;
        }).attr('visibility', function(d, i) {
          return (d.__visible ? 'visible' : 'hidden');
        });
      };

    }
  };

}();

Rna2D.components.nucleotides = function() {

  var ordered = {};

  return {

    config: {
      highlightColor: function() { return 'red'; },
      'class': 'nucleotide',
      classOf: function(d, i) { return ''; },
      color: 'black',
      fontSize: 11,
      gap: 1,
      click: null,
      mouseover: null,
      mouseout: null,
      getID: function(d) { return d.id; },
      getX: function(d) { return d.x; },
      getY: function(d) { return d.y; },
      getSequence: function(d) { return d.sequence; },
      highlight: Object,
      normalize: Object
    },

    sideffects: function(plot) {
      plot.nucleotides.computeOrder = function() {
        var nts = plot.nucleotides(),
            getID = plot.nucleotides.getID();
        for(var i = 0; i < nts.length; i++) {
          var id = getID(nts[i]);
          ordered[getID(nts[i])] = i;
        }

        return plot.nucleotides;
      };

      plot.nucleotides.indexOf = function(ntId) {
        return ordered[ntId];
      };

      plot.nucleotides.ordered = function(_) {
        if (!arguments.length) {
          return ordered;
        }
        ordered = _;
        return plot.nucleotides;
      };
    },

    actions: function(plot) {
      plot.nucleotides.all = function() {
        return plot.vis.selectAll('.' + plot.nucleotides['class']());
      };

      plot.nucleotides.interactions = function(obj) {
        if (!arguments.length) {
          obj = this;
        }
        var selector = '[nt1=' + obj.getAttribute('id') + '], [nt2=' + obj.getAttribute('id') + ']';
        return plot.vis.selectAll(selector);
      };

      plot.nucleotides.doColor = function() {
        return plot.nucleotides.all().attr('fill', plot.nucleotides.color());
      };
    }
  };

}();

Rna2D.views.airport.connections = function(plot) {

  // We need to track if we are drawing across the letter in which case we
  // need to use the width + radius, otherwise we just need to use the radius.
  // The bounding box is the upper left of the objects.
  var intersectPoint = function(obj1, obj2, r) {
    var bbox1 = obj1.getBBox(),
        bbox2 = obj2.getBBox(),
        x1 = bbox1.x,
        y1 = bbox1.y,
        x2 = bbox2.x,
        y2 = bbox2.y,
        dx = x2 - x1,
        dy = y2 - y1,
        almostFlat = 0.004;

    // Useful functions
    var sign = function(v) { return (v < 0 ? -1 : 1); },
        centerOf = function(bbox) { return { x: bbox.x + bbox.width/2, y: bbox.y + bbox.height/2 }; },
        dist = function(x, y) { return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)); };

    // Special case lines that are horizontal
    if (Math.abs(dy) < almostFlat) {
      y1 = y1 + bbox1.height/2;
      if (x1 < x2) {
        return { x: x1 + bbox1.width + r, y: y1 };
      }
      return { x : x1 - r, y: y1 };
    }

    // Special case lines that are vertical
    if (Math.abs(dx) < almostFlat) {
      x1 = x1 + bbox1.width/2;
      if (y1 > y2) {
        return { x: x1, y: y1 + r };
      }
      return { x: x1, y: y1 + bbox1.height + r};
    }

    // All other lines
    r = 1;
    var c = centerOf(bbox1),
        d = dist(dx, dy),
        a = sign(dx) * Math.abs(dx * r / d),
        b = sign(dy) * dist(r, a);

    return { x: c.x + a, y: c.y + b };
  };

  plot.connections  = function(standard) {

      // Compute the data to use for interactions
      var interactions = plot.interactions.valid(),
          getNTs = plot.interactions.getNTs();

      for(var i = 0; i < interactions.length; i++) {
        var obj = interactions[i],
            nts = getNTs(obj),
            nt1 = Rna2D.utils.element(nts[0]),
            nt2 = Rna2D.utils.element(nts[1]),
            p1 = intersectPoint(nt1, nt2, plot.nucleotides.gap()),
            p2 = intersectPoint(nt2, nt1, plot.nucleotides.gap());

        obj.line = { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y };
      }

      // Draw the interactions
      plot.vis.selectAll(plot.interactions['class']())
        .data(interactions)
        .enter().append('svg:line')
        .call(standard)
        .attr('stroke', plot.interactions.color())
        .attr('x1', function(d) { return d.line.x1; })
        .attr('y1', function(d) { return d.line.y1; })
        .attr('x2', function(d) { return d.line.x2; })
        .attr('y2', function(d) { return d.line.y2; });

    return plot;
  };

  plot.interactions.highlight(function() {
    var obj = this,
        highlightColor = plot.interactions.highlightColor();
    d3.select(obj).style('stroke', highlightColor(obj));
    return plot.interactions.nucleotides(obj).style('stroke', highlightColor(obj));
  });

  plot.interactions.normalize(function() {
    var obj = this;
    d3.select(obj).style('stroke', null);
    return plot.interactions.nucleotides(obj).style('stroke', null);
  });

  return Rna2D;
};

Rna2D.views.airport.coordinates = function(plot) {

  // We make a chart function which draws the nucleotides in the given
  // coordinates.
  plot.coordinates = function(standard) {

    var data = plot.nucleotides(),
        width = plot.width(),
        height = plot.height(),
        margin = plot.margin();

    // Compute the scales and ranges.
    var xCoordMax = d3.max(data, function(d) { return d.x; }),
        yCoordMax = d3.max(data, function(d) { return d.y; }),
        xMax = d3.max([width, xCoordMax]),
        yMax = d3.max([height, yCoordMax]),
        xScale = d3.scale.linear()
          .domain([-margin.right, xMax + margin.left])
          .range([0, width]),
        yScale = d3.scale.linear()
          .domain([-margin.above, yMax + margin.below])
          .range([0, height]);

    plot.xScale(xScale);
    plot.yScale(yScale);
    plot.__xCoordMax = xCoordMax;
    plot.__yCoordMax = yCoordMax;

    // Draw all nucleotides.
    plot.vis.selectAll(plot.nucleotides['class']())
      .data(data).enter().append('svg:text')
      .call(standard)
      .attr('x', function(d, i) { 
        var x = xScale(plot.nucleotides.getX()(d, i));
        d.__x = x;
        return x; 
      })
      .attr('y', function(d, i) { 
        var y = yScale(plot.nucleotides.getY()(d, i));
        d.__y = y;
        return  y;
      })
      .attr('font-size', plot.nucleotides.fontSize())
      .attr('fill', plot.nucleotides.color())
      .text(plot.nucleotides.getSequence())
      .attr('fill', plot.nucleotides.color());

    return plot;
  };

  plot.nucleotides.highlight(function() {
    var obj = this,
        highlightColor = plot.nucleotides.highlightColor();
    d3.select(obj).style('stroke', highlightColor());
    return plot.nucleotides.interactions(obj)
      .style('stroke', highlightColor());
  });

  plot.nucleotides.normalize(function() {
    var obj = this;
    d3.select(obj).style('stroke', null);
    return plot.nucleotides.interactions(obj)
      .style('stroke', null);
  });

  return Rna2D;
};

Rna2D.views.airport.groups = function(plot) {

  plot.groups = function(standard) {
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

          if (elem === null) {
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
      }

      var motifLine = d3.svg.line()
        .x(function(d) { return d.x; })
        .y(function(d) { return d.y; });

      // Draw the motif boxes
      plot.vis.selectAll(plot.motifs['class']())
        .data(plot.motifs()).enter().append('svg:path')
        .call(standard)
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

Rna2D.views.circular.connections = function(plot) {

  plot.connections = function(standard) {

    var getNTs = plot.interactions.getNTs();

   // Use to compute where to place the arcs for interaction arcs.
   var innerArc = d3.svg.arc()
          .outerRadius(plot.__ntArc.innerRadius()())
          .innerRadius(plot.__ntArc.innerRadius()() - 3)
          .startAngle(plot.__ntArc.startAngle())
          .endAngle(plot.__ntArc.endAngle());

    var position = function(ntId) {
      var centroid = innerArc.centroid(null, plot.nucleotides.indexOf(ntId)),
          c = plot.__circleCenter;
      return { x: c.x + centroid[0], y: c.y + centroid[1] };
    };

    var curve = function(d, i) {
      var startAngle = innerArc.startAngle(),
          nts = getNTs(d),
          from = position(nts[0]),
          to = position(nts[1]),
          distance = Rna2D.utils.distance(from, to),
          angleDiff = startAngle(null, plot.nucleotides.indexOf(nts[0])) -
                      startAngle(null, plot.nucleotides.indexOf(nts[1])),
          radius = innerArc.innerRadius()() * Math.tan(angleDiff/2),
          sweep  = 0;

      if (plot.nucleotides.indexOf(nts[0]) > plot.nucleotides.indexOf(nts[1])) {
        sweep = 1;
      }

      return "M "  + from.x + " " + from.y +     // Start point
             " A " + radius + "," + radius +     // Radii of elpise
             " " + 0 +                           // Rotation
             " " + 0 + " " + sweep +             // Large Arc and Sweep flag
             " " + to.x + "," + to.y;            // End point

    };

    plot.vis.selectAll(plot.interactions['class']())
      .data(plot.interactions.valid()).enter().append('path')
      .call(standard)
      .attr('d', curve)
      .attr('fill', 'none')
      .attr('stroke', plot.interactions.color());

    return plot;
  };

  plot.interactions.highlight(function() {
    var obj = this,
        highlightColor = plot.interactions.highlightColor(),
        nts = plot.interactions.nucleotides(obj);

    d3.select(obj).style('stroke', highlightColor(obj));
    plot.pie.addLetters()(nts[0]); // TODO: WTF?

    return nts.style('stroke', highlightColor(obj));
  });

  plot.interactions.normalize(function() {
    var obj = this;
    d3.select(obj).style('stroke', null);
    plot.pie.clearLetters()();
    plot.interactions.nucleotides(obj).style('stroke', null);
    return plot.interactions;
  });

  return Rna2D;
};

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

    var nts = plot.nucleotides();
    for(var i = 0; i < nts.length; i++) {
      var centroid = arc.centroid(null, i);
      nts[i].__x = center.x + centroid[0];
      nts[i].__y = center.y + centroid[1];
    }

    plot.vis.selectAll(plot.nucleotides['class']())
      .append('g')
      .data(plot.nucleotides()).enter().append('svg:path')
      .call(standard)
      .attr('d', arc)
      .attr('transform', 'translate(' + center.x + ',' + center.y + ')')
      .attr('fill', plot.nucleotides.color());

    plot.__ntArc = arc;
    plot.__circleCenter = center;
    plot.xScale(d3.scale.identity().domain([0, plot.width()])) 
        .yScale(d3.scale.identity().domain([0, plot.height()]));

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

Rna2D.views.circular.groups = function(plot) {
  plot.groups = function(standard) {
    return plot;
  };

  return Rna2D;
};

})();
