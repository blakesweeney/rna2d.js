(function () {
  'use strict';
/*globals window, d3, document, $, jmolApplet, jmolScript */

var Rna2D = window.Rna2D || function(config) {

  // A function to call when we are building the nts, interactions or motifs.
  // All have some steps in common so we move them somewhere common.
  var standardBuild = function(type, selection) {
    var klass = type['class'](),
        classOf = type.classOf();

    Rna2D.utils.attachHandlers(selection, type);

    return selection.attr('id', type.elementID)
      .attr('class', function(d, i) { return classOf(d, i).concat(klass).join(' '); })
      .attr('visibility', type.visibility);
  };

  var plot = function() {

    // Compute the nucleotide ordering. This is often used when drawing
    // interactions.
    plot.nucleotides.computeOrder();

    // Setup the view
    plot.view.setup();

    var margin = plot.margin(),
        selection = d3.select(plot.selection()),
        scale = function(domainFn, max) { 
          return d3.scale.linear().domain(domainFn()).range([0, max]);
        };

    // Setup the overall drawing area
    selection.select('svg').remove();
    var top = selection.append('svg')
      .attr('width', plot.width() + margin.left + margin.right)
      .attr('height', plot.height() + margin.above + margin.below);

    plot.vis = top.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.above + ")");

    // Setup the scales
    plot.xScale(scale(plot.xDomain, plot.width() - margin.right));
    plot.yScale(scale(plot.yDomain, plot.height() - margin.above));

    // Generate the components - brush, frame, zoom, etc
    plot.components();

    // Draw all coordinates and attach all standard data
    plot.coordinates(function(selection) {

      var x = plot.views[plot.view()].xCoord(),
          y = plot.views[plot.view()].yCoord();

      standardBuild(plot.nucleotides, selection)
        .datum(function(d, i) {
          d.__x = x(d, i);
          d.__y = y(d, i);
          return d;
        })
        .attr('data-sequence', plot.nucleotides.getSequence());

      return selection;
    });

    // Draw all interactions and add all common data
    plot.connections(function(selection) {
      var ntsOf = plot.interactions.getNTs();

      standardBuild(plot.interactions, selection)
        .attr('data-nts', function(d, i) { return ntsOf(d).join(','); })
        .attr('nt1', function(d, i) { return ntsOf(d)[0]; })
        .attr('nt2', function(d, i) { return ntsOf(d)[1]; });

      return selection;
    });

    // Draw motifs
    plot.groups(function(selection) {
      var ntsOf = plot.motifs.getNTs();

      standardBuild(plot.motifs, selection)
        .attr('data-nts', function(d) { return plot.motifs.getNTs()(d).join(','); });

      return selection;
    });

    return plot;
  };

  // Configure the plot
  Rna2D.config(plot, config);

  // Add all components.
  Rna2D.components(plot);

  // Add the views
  Rna2D.views(plot);

  return plot;
};

window.Rna2D = Rna2D;

Rna2D.components = function(plot) {

  var actions = false;

  // Create the toplevel component which calls each subcomponent component
  plot.components = function() {

    $.each(Rna2D.components, function(name, obj) {

      if (obj.hasOwnProperty('actions') && !actions) {
        // If something is toggable we will add all the toggable functions.
        if (obj.togglable) {
          Rna2D.togglable(plot, name);
        }

        obj.actions(plot);
      }

      if (obj.hasOwnProperty('generate')) {
        try {
          obj.generate(plot);
        } catch (except) {
          console.log("Error generating component " + name);
          console.log(except);
        }
      }
    });

    actions = true;
  };

  // Create each subcomponent with its accessor function, config, side 
  // effects, and rendering function.
  $.each(Rna2D.components, function(name, obj) {

    // Generate the accessor function
    (function(prop) {
      var data = null;
      plot[prop] = function(x) {
        if (!arguments.length) {
          return data;
        }
        data = x;
        return plot[prop];
      };
    }(name));

    Rna2D.utils.generateAccessors(plot[name], obj.config(plot));

    // Perform the side effects. These often create functions which need to be
    // created before the plot is drawn.
    if (obj.hasOwnProperty('sideffects')) {
      obj.sideffects(plot);
    }

    if (plot[name].hasOwnProperty('encodeID') && plot[name].hasOwnProperty('getID')) {
      plot[name].elementID = function(d, i) {
        var encode = plot[name].encodeID(),
            getID = plot[name].getID();
        return encode(getID(d, i));
      };
    }

    if (plot[name].hasOwnProperty('getNTs')) {
      (function(prop) {
        plot[prop].ntElements = function(d, i) {
          var getNTs = plot[prop].getNTs();
          return $.map(getNTs(d, i), plot.nucleotides.encodeID());
        };
      }(name));
    }

    plot.components[name] = obj;
  });

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

  Rna2D.utils.generateAccessors(plot, $.extend(config, given));

  return plot;
};

Rna2D.togglable = function(plot, name) {

  var type = plot[name],
      status = {};

  type.all = function(klass) {
    klass = (klass && klass !== 'all' ? klass : type['class']());
    return plot.vis.selectAll('.' + klass);
  };

  type.visible = function() {
    $.each(arguments, function(i, klass) { status[klass] = true; });
  };

  type.hidden = function() {
    $.each(arguments, function(i, klass) { status[klass] = null;  });
  };

  type.show = function(klass) {
    status[klass] = true;
    return type.all(klass).attr('visibility', function() { return 'visible'; });
  };

  type.hide = function(klass) {
    status[klass] = null;
    return type.all(klass).attr('visibility', function() { return 'hidden'; });
  };

  type.toggle = function(klass) {
    return (status[klass] ? type.hide(klass) : type.show(klass));
  };

  // Note that we use null above so here we can use the fact that jQuery's map
  // is actually a map/filter to remove elements as we traverse.
  type.visibility = function(d, i) {
    var klasses = type.classOf()(d),
        found = $.map(klasses, function(k, i) { return status[k]; });
    return (found.length ? 'visible' : 'hidden');
  };

};

Rna2D.utils = (function() {
  var my = {};

  my.distance = function(a, b) {
    return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
  };

  my.generateAccessors = function(obj, state, callback) {
    $.each(state, function(key, value) {
      obj[key] = (function() {
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
      }());
    });
  };

  my.attachHandlers = function(selection, obj) {
    var handlers = ['click', 'mouseover', 'mouseout'];

    if (obj.mouseover() === 'highlight') {
      selection
        .on(handlers.pop(), obj.normalize())
        .on(handlers.pop(), obj.highlight());
    }


    $.each(handlers, function(i, handler) {
      selection.on(handler, obj[handler]());
    });

    return selection;
  };

  // Get an element by id.
  my.element = function(id) {
    return document.getElementById(id);
  };

  // Not very good compose function. The idea is compose(f, g, h)(a) == h(g(f(a)))
  my.compose = function() {
    // Why can't jquery have some more nice functional tools like reduce and
    // compose?
    var funcs = arguments;
    return function() {
      var res = arguments;
      $.each(funcs, function(i, fn) { res = [fn.apply(this, res)]; });
      return res;
    };
  };

  return my;
}());

Rna2D.views = function(plot) { 

  // Generate the setup function, which draws the view.
  plot.view.setup = function() {
    var view = Rna2D.views[plot.view()];

    if (view === undefined) {
      console.log("Unknown view " + plot.view());
      return false;
    }

    // Overwrite all previous drawing functions
    plot.coordinates = view.coordinates;
    plot.connections = view.connections;
    plot.groups = view.groups;
    plot.xDomain = view.xDomain;
    plot.yDomain = view.yDomain;

    // Trigger the side effects
    view.sideffects();
  };

  plot.views = {};

  // Add all config
  $.each(Rna2D.views, function(name, view) {
      view = view(plot);
      var config = view.config;
      if (typeof(config) === "function") {
        config = config(plot);
      }
      plot.views[name] = {};
      Rna2D.utils.generateAccessors(plot.views[name], config);
      Rna2D.views[name] = view;
    });
};

Rna2D.components.brush = (function() {

  var startBrush, updateBrush, endBrush;

  return {

    config: function(plot) {
      return {
        enabled: true,
        initial: [],
        'class': 'brush',
        update: Object,
        clear: Object
      };
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

      endBrush = function () {
        var matched = [];

        if (plot.brush().empty()) {
          plot.brush.clear();
        } else {

          var e = plot.brush().extent();
          plot.vis.selectAll('.' + plot.nucleotides['class']())
            .attr("selected", function(d) {
              if (e[0][0] <= d.__x && d.__x <= e[1][0] &&
                  e[0][1] <= d.__y && d.__y <= e[1][1]) {
                matched.push(d);
              return 'selected';
              }
              return '';
            });

          plot.brush.update()(matched);
        }
      };

      plot.brush(d3.svg.brush()
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

}());

Rna2D.components.frame = {

  config: function(plot) {
    return {
      add: true,
      'class': 'frame'
    };
  },

  generate: function(plot) {

    if (!plot.frame.add()) {
      return plot.vis;
    }

    // TODO: Change this to ignore margins.
    return plot.vis.append('svg:rect')
      .classed(plot.frame['class'](), true)
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', plot.width() + plot.margin().left + plot.margin().right)
      .attr('height', plot.height() + plot.margin().below + plot.margin().above)
      .style('pointer-events', 'none');
  }
};

Rna2D.components.interactions = (function () {

  return {

    togglable: true,
    config: function(plot) {
      return {
        getFamily: function(d) { return d.family; },
        getNTs: function(d) { return [d.nt1, d.nt2]; },
        mouseover: null,
        mouseout: null,
        click: function(d) {
          var nts = plot.interactions.nucleotides(this);
          plot.jmol.showSelection(nts.data());
        },
        'class': 'interaction',
        classOf: function(d) { return [d.family]; },
        highlightColor: function() { return 'red'; },
        highlight: Object,
        normalize: Object,
        isForward: function(d) {
          var getFamily = plot.interactions.getFamily(),
              family = getFamily(d);
          if (family.length === 3) {
            family = family.slice(1, 3).toUpperCase();
          } else {
            family = family.slice(2, 4).toUpperCase();
          }
          return family === 'WW' || family === 'WH' || family === 'WS' ||
                 family === 'HH' || family === 'SH' || family === 'SS';
        },
        isSymmetric: function(d, i) {
          var getFamily = plot.interactions.getFamily(),
              family = getFamily(d);
          return family[1] === family[2];
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
        encodeID: function(id) { return id; },
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
            indexOf = plot.nucleotides.indexOf;

        $.each(interactions, function(i, current) {
          var id = getID(current),
              nts = getNts(current);

          if (isForward(current) && !seen[id] && nts.length &&
              indexOf(nts[0]) !== null && indexOf(nts[1]) !== null) {
            seen[id] = true;
            valid.push(current);
          }
        });

        return valid;
      };
    },

    actions: function(plot) {

      plot.interactions.visible('cWW', 'ncWW');

      //plot.interactions.jmol = function(callback) {
        //return function(data) {
        //};
      //};

      //plot.interactions.ntData = function(data) {
        //var nts = plot.interactions.nucleotides(data);
        //nts = $.map(nts, function(nt, i) { return 
        //return nts;
      //};

      plot.interactions.nucleotides = function(obj) {
        obj = obj || this;
        var data = d3.select(obj).datum(),
            nts = plot.interactions.ntElements(data),
            selector = '#' + nts.join(', #');
        return plot.vis.selectAll(selector);
      };

    }
  };

}());

Rna2D.components.jmol = {

  config: function(plot) {
    return {
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
    };
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

      if (matched.length > plot.jmol.maxSize()) {
        return plot.jmol.overflow();
      }

      var data = $.map(matched, plot.nucleotides.getID());
      data = data.join(',');

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

  }

};

Rna2D.components.labels = {
  config: function(plot) {
    return {
      majorTickClass: 'major-tick',
      minorTickClass: 'minor-tick',
      labelClass: 'label',
      width: 5,
      fontSize: 12,
      majorTickCount: 30,
      //majorTickGenerator: function(length) {
      //var scale = d3.scale.identity()
      //.domain([1, plot.nucleotides().length + 1])
      //.range([1, plot.nucleotides().length + 1]);
      //return scale.ticks(plot.labels.majorTickCount());
      //},
      minorTickCount: 150,
      //minorTickGenerator: function(length) {
      //var scale = d3.scale.identity()
      //.domain([1, plot.nucleotides().length + 1])
      //.range([1, plot.nucleotides().length + 1]);
      //return scale.ticks(plot.labels.minorTickCount());
      //}
    };
  }
};

Rna2D.components.motifs = (function () {

  return {

    togglable: true,
    config: function(plot) {
      return {
        classOf: function(d) { return [d.id.split("_")[0]]; },
        'class': 'motif',
        highlightColor: function() { return 'red'; },
        click: function(d) {
          var nts = plot.motifs.nucleotides(this).data();
          return plot.jmol.showSelection(nts);
        },
        mouseover: null,
        mouseout: null,
        getID: function(d) { return d.id; },
        encodeID: function(id) { return id; },
        getNTs: function(d) { return d.nts; },
        highlight: Object,
        normalize: Object
      };
    },

    actions: function(plot) {

      plot.motifs.visible('IL', 'HL', 'J3');

      plot.motifs.nucleotides = function(obj) {
        var motifData = d3.select(obj).datum(),
            nts = plot.motifs.ntElements(motifData),
            selector = '#' + nts.join(', #');
        return plot.vis.selectAll(selector);
      };

    }
  };

}());

Rna2D.components.nucleotides = (function() {

  var ordered = {};

  return {

    togglable: true,
    config: function(plot) {
      return {
        highlightColor: function() { return 'red'; },
        'class': 'nucleotide',
        classOf: function(d, i) { return [d.sequence]; },
        color: 'black',
        click: function(d, i) { return plot.jmol.showSelection([d]); },
        mouseover: null,
        mouseout: null,
        getID: function(d) { return d.id; },
        getX: function(d) { return d.x; },
        getY: function(d) { return d.y; },
        encodeID: function(id) { return id; },
        getSequence: function(d) { return d.sequence; },
        highlight: Object,
        normalize: Object,
        toggleLetters: Object
      };
    },

    sideffects: function(plot) {
      plot.nucleotides.computeOrder = function() {
        var nts = plot.nucleotides(),
        getID = plot.nucleotides.getID();

        $.each(nts, function(i, nt) {
          ordered[getID(nt)] = i;
        });

        return plot.nucleotides;
      };

      plot.nucleotides.indexOf = function(ntId) {
        if (!ordered.hasOwnProperty(ntId)) {
          return null;
        }
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
      plot.nucleotides.visible('A', 'C', 'G', 'U');

      plot.nucleotides.interactions = function(d, i) {
        var id = plot.nucleotides.getID()(d, i),
            selector = '[nt1=' + id + '], [nt2=' + id + ']';
        return plot.vis.selectAll(selector);
      };

      plot.nucleotides.doColor = function() {
        return plot.nucleotides.all().attr('fill', plot.nucleotides.color());
      };
    }
  };

}());

Rna2D.views.airport = function(plot) {

  // Common variables.
  var coordMax = {};

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
        return { x: x1, y: y1 };
      }
      return { x: x1, y: y1 + bbox1.height };
    }

    // All other lines
    r = 1;
    var c = centerOf(bbox1),
        d = dist(dx, dy),
        a = sign(dx) * Math.abs(dx * r / d),
        b = sign(dy) * dist(r, a);

    return { x: c.x + a, y: c.y + b };
  };

  // A function to define the axes.
  var domain = function(property) {
    return function() { 
      var max = d3.max(plot.nucleotides(), function(d) { return d[property]; });
      coordMax[property] = max;
      return [0, max]; 
    };
  };

  // We make a chart function which draws the nucleotides in the given
  // coordinates.
   var coordinates = function(standard) {

    // Draw all nucleotides.
    plot.vis.selectAll(plot.nucleotides['class']())
      .data(plot.nucleotides()).enter().append('svg:text')
      .call(standard)
      .attr('x', function(d, i) { return plot.xScale()(plot.nucleotides.getX()(d, i)); })
      .attr('y', function(d, i) { return plot.yScale()(plot.nucleotides.getY()(d, i)); })
      .attr('font-size', plot.views.airport.fontSize())
      .text(plot.nucleotides.getSequence())
      .attr('fill', plot.nucleotides.color());

    return plot;
  };

  // Function to draw the connections.
  var connections = function(standard) {

    // Compute the data to use for interactions
    var interactions = plot.interactions.valid(),
        getNTs = plot.interactions.ntElements;

    interactions = $.map(interactions, function(obj, i) {
      try {
        var nts = getNTs(obj),
            nt1 = Rna2D.utils.element(nts[0]),
            nt2 = Rna2D.utils.element(nts[1]),
            p1 = intersectPoint(nt1, nt2, plot.views.airport.gap()),
            p2 = intersectPoint(nt2, nt1, plot.views.airport.gap());
        obj.line = { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y };
      } catch (err) {
        console.log("Could not compute interaction line for", obj);
        return null;
      }
      
      return obj;
    });

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

  var groups = function(standard) {
      // Compute a box around the motif
      var motifs = plot.motifs(),
          i = 0,
          j = 0;

      if (!motifs || !motifs.length) {
        return plot;
      }

      $.each(motifs, function(i, current) {
        var left = 0,
            right = coordMax.x,
            top = coordMax.y,
            bottom = 0;

        current.missing = [];

        // Find the outer points.
        var nts = plot.motifs.ntElements(current);
        $.each(nts, function(j, id) {
          var elem = Rna2D.utils.element(id);

          if (elem === null) {
            console.log('Missing nt ' + id + ' in motif: ', current);
            current.missing.push(id);
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
        });

        // Store bounding box. It is very odd to get a bounding box that
        // involves the outer edges. In this case we think that we have not
        // actually found the nts so we log this and use a box that cannot
        // be seen. This prevents bugs where we stop drawing boxes too early.
        if (bottom === 0 || left === 0 || right === coordMax.x || top === coordMax.y) {
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

      });

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

  return {
    config: {
      fontSize: 11,
      gap: 1,
      xCoord: function(d, i) { return plot.xScale()(plot.nucleotides.getX()(d, i)); },
      yCoord: function(d, i) { return plot.yScale()(plot.nucleotides.getY()(d, i)); }
    },
    xDomain: domain('x'),
    yDomain: domain('y'),
    connections: connections,
    coordinates: coordinates,
    groups: groups,
    sideffects: function() {
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

      plot.nucleotides.highlight(function(d, i) {
        var obj = this,
            highlightColor = plot.nucleotides.highlightColor();
        d3.select(obj).style('stroke', highlightColor());
        return plot.nucleotides.interactions(d, i)
          .style('stroke', highlightColor());
      });

      plot.nucleotides.normalize(function(d, i) {
        var obj = this;
        d3.select(obj).style('stroke', null);
        return plot.nucleotides.interactions(d, i)
          .style('stroke', null);
      });

      plot.motifs.highlight(function() {
        var obj = this,
            highlightColor = plot.motifs.highlightColor();
        return plot.motifs.nucleotides(obj).style('stroke', highlightColor(obj));
      });

      plot.motifs.normalize(function() {
        var obj = this;
        return plot.motifs.nucleotides(obj).style('stroke', null);
      });

    }
  };

};

Rna2D.views.circular = function(plot) {

  // Some common config variables
  var outer, inner, center, angleSize, halfGap, startAngle, endAngle;

  // Used to compute where to place the backbone arc.
  var ntArc;

  // Use to compute where to place the arcs for interaction arcs.
  var innerArc;

  var position = function(ntId) {
    var centroid = innerArc.centroid(null, plot.nucleotides.indexOf(ntId)),
    c = plot.views.circular.center()();
    return { x: c.x + centroid[0], y: c.y + centroid[1] };
  };

  var curve = function(d, i) {
    // The idea is to sort the nts such that we are always drawing from lower to
    // higher nts, unless we are drawing from one half to the other half, in
    // which case we flip the order. This lets us always use the sweep and arc
    // flags of 0,0. The code is kinda gross but it works.
    var length = plot.nucleotides().length,
        indexOf = plot.nucleotides.indexOf,
        nts = plot.interactions.getNTs()(d).sort(function(nt1, nt2) { 
          var i1 = indexOf(nt1),
              i2 = indexOf(nt2);
          if (Math.abs(i1 - i2) > length /2) {
            return i2 - i1;
          }
          return i1 - i2; 
        });

    var from = position(nts[0]),
        to = position(nts[1]),
        angleDiff = startAngle(null, indexOf(nts[0])) - startAngle(null, indexOf(nts[1])),
        radius = Math.abs(innerArc.innerRadius()() * Math.tan(angleDiff/2));

    return "M "  + from.x + " " + from.y +  // Start point
      " A " + radius + "," + radius +       // Both radi are the same for a circle
      " 0 0,0 " +                           // Rotation and arc flags are always 0
      to.x + "," + to.y;                    // End point

  };

  // Function to draw the arcs.
  var coordinates = function(standard) {

    outer = plot.views.circular.radius()();
    inner = outer - plot.views.circular.width();
    center = plot.views.circular.center()();
    angleSize = (2*Math.PI - plot.views.circular.arcGap()) / plot.nucleotides().length;
    halfGap = plot.views.circular.arcGap() / 2;
    startAngle = function(d, i) { return i * angleSize + halfGap; };
    endAngle = function(d, i) { return (i + 1) * angleSize + halfGap; };

    ntArc = d3.svg.arc()
      .outerRadius(outer)
      .innerRadius(inner)
      .startAngle(startAngle)
      .endAngle(endAngle);

    // Define the scales we are using
    plot.xScale(d3.scale.identity().domain([0, plot.width()]))
      .yScale(d3.scale.identity().domain([0, plot.height()]));

    // Draw the arcs
    plot.vis.selectAll(plot.nucleotides['class']())
      .append('g')
      .data(plot.nucleotides()).enter().append('svg:path')
      .call(standard)
      .attr('d', ntArc)
      .attr('transform', 'translate(' + center.x + ',' + center.y + ')')
      .attr('fill', plot.nucleotides.color());

    return plot;
  };

  // Function to draw all connections.
  var connections = function(standard) {

    innerArc = d3.svg.arc()
      .outerRadius(inner)
      .innerRadius(inner - plot.views.circular.interactionGap())
      .startAngle(startAngle)
      .endAngle(endAngle);

    return plot.vis.selectAll(plot.interactions['class']())
      .data(plot.interactions.valid()).enter().append('path')
      .call(standard)
      .attr('d', curve)
      .attr('fill', 'none')
      .attr('stroke', plot.interactions.color());
  };

  return {

    xDomain: function() { return [0, 1000]; },
    yDomain: function() { return [0, 1000]; },
    coordinates: coordinates,
    connections: connections,
    groups: function(standard) { return plot; },
    config: {
      radius: function() {
        return plot.width() / 4;
      },
      width: 4,
      arcGap: 0.2,
      interactionGap: 3,
      letterClass: 'nucleotide-letter',
      xCoord: function(d, i) {
        return ntArc.centroid(null, i).x;
      },
      yCoord: function(d, i) {
        return ntArc.centroid(null, i).y;
      },
      center: function() {
        return { x: plot.width() / 2, y: plot.height() / 2 };
      },
      letterID: function(obj) {
        return obj.getAttribute('id') + '-letter';
      },
      letterSize: 20,
      letterPosition: function(obj) {
        var data = d3.select(obj).datum(),
            index = plot.nucleotides.indexOf(plot.nucleotides.getID()(data)),
            position = ntArc.centroid(null, index),
            center = plot.views.circular.center()();
        return { x: center.x + position[0], y: center.y + position[1] };
      },
      addLetters: function(nts) {
        var positionOf = plot.views.circular.letterPosition(),
            highlightColor = plot.nucleotides.highlightColor();

        plot.vis.selectAll(plot.views.circular.letterClass())
          .data(nts).enter().append('svg:text')
          .attr('id', plot.views.circular.letterID())
          .attr('class', plot.views.circular.letterClass())
          .attr('x', function(d) { return positionOf(d).x; })
          .attr('y', function(d) { return positionOf(d).y; })
          .attr('font-size', plot.views.circular.letterSize())
          .attr('pointer-events', 'none')
          .text(function(d) { return d.getAttribute('data-sequence'); })
          .attr('fill', function(d) { return highlightColor(d); });

        return plot;
      },
      clearLetters: function() {
        return plot.vis.selectAll('.' + plot.views.circular.letterClass()).remove();
      }
    },

    sideffects: function() {

      plot.nucleotides.highlight(function(d, i) {
        var obj = this,
            highlightColor = plot.nucleotides.highlightColor();
            d3.select(obj).style('stroke', highlightColor(obj));

        plot.views.circular.addLetters()([obj]);

        return plot.nucleotides.interactions(d, i)
          .style('stroke', highlightColor(obj));
      });

      plot.nucleotides.normalize(function(d, i) {
        var obj = this;
        d3.select(obj).style('stroke', null);
        plot.views.circular.clearLetters()();
        return plot.nucleotides.interactions(d, i)
          .style('stroke', null);
      });

      plot.interactions.highlight(function(d, i) {
        var obj = this,
            highlightColor = plot.interactions.highlightColor(),
            nts = plot.interactions.nucleotides(obj);

        d3.select(obj).style('stroke', highlightColor(obj));
        plot.views.circular.addLetters()(nts[0]); // TODO: WTF?

        return nts.style('stroke', highlightColor(obj));
      });

      plot.interactions.normalize(function(d, i) {
        var obj = this;
        d3.select(obj).style('stroke', null);
        plot.views.circular.clearLetters()();
        plot.interactions.nucleotides(obj).style('stroke', null);
        return plot.interactions;
      });
    }
  };

};


}());
