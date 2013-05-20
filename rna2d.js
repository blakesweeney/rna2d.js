(function () {
  'use strict';
/*globals window, d3, document, $, jmolApplet, jmolScript */

var Rna2D = window.Rna2D || function(config) {

  var plot = function() {

    // Setup the view
    plot.view.setup();

    var margin = plot.margin(),
        selection = d3.select(plot.selection()),
        scale = function(domain, max) {
          return d3.scale.linear().domain(domain).range([0, max]);
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

    // A function to call when we are building the nts, interactions or motifs.
    // All have some steps in common so we move them somewhere common.
    var standardBuild = function(type) {
      return function(selection) {
        var klass = type['class'](),
            classOf = type.classOf();

        Rna2D.utils.attachHandlers(selection, type);

        return selection.attr('id', type.elementID)
          .attr('class', function(d, i) {
            return classOf(d, i).concat(klass).join(' ');
          })
          .attr('visibility', type.visibility);
      };
    };

    // Draw all coordinates and attach all standard data
    plot.coordinates(function(selection) {

      var x = plot.views[plot.view()].xCoord(),
          y = plot.views[plot.view()].yCoord();

      return standardBuild(plot.nucleotides)(selection)
        .datum(function(d, i) {
          d.__x = x(d, i);
          d.__y = y(d, i);
          return d;
        });
    });

    // Draw all interactions and add all common data
    plot.connections(standardBuild(plot.interactions));

    // Draw motifs
    plot.groups(standardBuild(plot.motifs));

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

    // Generate the accessor function if needed
    if (obj.dataStore) {
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
    } else {
      plot[name] = {};
    }

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

    if (view.hasOwnProperty('preprocess')) {
      view.preprocess();
    }

    var domain = view.domain();

    // Overwrite all previous drawing functions
    plot.coordinates = view.coordinates;
    plot.connections = view.connections;
    plot.groups = view.groups;
    plot.xDomain = domain.x;
    plot.yDomain = domain.y;

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

  return {

    dataStore: true,
    config: function(plot) {
      return {
        enabled: true,
        'class': 'brush',
        update: Object,
        clear: Object
      };
    },

    sideffects: function(plot) {

      // Jmol interface
      plot.brush.jmol = function(nts) {
        var idOf = plot.nucleotides.getID(),
            ids = $.map(nts, idOf);
        return plot.jmol.showNTs(ids);
      };

    },

    actions: function(plot) {

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

      var endBrush = function () {
        var nts = [],
            e = plot.brush().extent();

        if (plot.brush().empty()) {
          return plot.brush.clear()();
        }

        plot.vis.selectAll('.' + plot.nucleotides['class']())
          .attr("selected", function(d) {
            if (e[0][0] <= d.__x && d.__x <= e[1][0] &&
                e[0][1] <= d.__y && d.__y <= e[1][1]) {
              nts.push(d);
            return 'selected';
            }
            return '';
          });

        return plot.brush.update()(nts);
      };

      plot.brush(d3.svg.brush()
        .on('brushend', endBrush)
        .x(plot.xScale())
        .y(plot.yScale()));

      if (plot.brush.enabled()) {
        plot.brush.enable();
      }

      return plot.brush;
    }
  };

}());

Rna2D.components.chains = (function () {

  return {
    dataStore: true,
    config: function() {
      return {
        getID: function(d, i) { return d.id; },
        'class': 'chain',
        classOf: function(d, i) { return []; },
        getNTData: function(d, i) { return d.nts; },
      };
    },

    sideffects: function(plot) { 
      plot.chains.chainOf = function(d, i) {
        var ntsOf = plot.chains.getNTData(),
            chainIndex = -1,
            compare = function(d, i, chain) { return ntsOf(chain)[i] === d; };

          if (typeof(d) === "string") {
            var idOf = plot.nucleotides.getID();
            compare = function(d, i, chain) {
              return idOf(ntsOf(chain)[i]) === d;
            };
          }

        $.each(plot.chains(), function(index, chain) {
          if (compare(d, i, chain)) {
            chainIndex = index;
          }
        });
        return chainIndex;
      };
    },

    actions: function() {}

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

    dataStore: true,
    togglable: true,
    config: function(plot) {
      return {
        getFamily: function(d) { return d.family; },
        getNTs: function(d) { return [d.nt1, d.nt2]; },
        mouseover: null,
        mouseout: null,
        click: Object,
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
            encodeID = plot.nucleotides.encodeID(),
            bboxOf = function (id) { return document.getElementById(encodeID(id)); };

        $.each(interactions, function(i, current) {
          var id = getID(current),
              nts = getNts(current);

          if (isForward(current) && !seen[id] && nts.length &&
              bboxOf(nts[0]) !== null && bboxOf(nts[1]) !== null) {
            seen[id] = true;
            valid.push(current);
          }
        });

        return valid;
      };

      plot.interactions.jmol = function(d, i) {
        var getNTs = plot.interactions.getNTs();
        return plot.jmol.showNTs(getNTs(d, i));
      };
    },

    actions: function(plot) {

      plot.interactions.visible('cWW', 'ncWW');

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
    plot.jmol.showNTs = function(ntIDs) {
      plot.jmol.setup();

      if (ntIDs.length > plot.jmol.maxSize()) {
        return plot.jmol.overflow();
      }

      $('#' + plot.jmol.tmpID()).remove();
      $('body').append("<input type='radio' id='" + plot.jmol.tmpID() +
                       "' data-coord='" + ntIDs.join(',') + "'>");
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

    dataStore: true,
    togglable: true,
    config: function(plot) {
      return {
        classOf: function(d) { return [d.id.split("_")[0]]; },
        'class': 'motif',
        highlightColor: function() { return 'red'; },
        click: Object,
        mouseover: null,
        mouseout: null,
        getID: function(d) { return d.id; },
        encodeID: function(id) { return id; },
        getNTs: function(d) { return d.nts; },
        highlight: Object,
        normalize: Object
      };
    },

    sideffects: function(plot) {
      plot.motifs.jmol = function(d, i) {
        var getNTs = plot.motifs.getNTs();
        return plot.jmol.showNTs(getNTs(d, i));
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

  var grouped = [];

  return {

    togglable: true,
    config: function(plot) {
      return {
        highlightColor: function() { return 'red'; },
        'class': 'nucleotide',
        classOf: function(d, i) { return [d.sequence]; },
        color: 'black',
        click: Object,
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

      plot.nucleotides.jmol = function(d, i) {
        var idOf = plot.nucleotides.getID();
        return plot.jmol.showNTs([idOf(d, i)]);
      };

      plot.nucleotides.count = function() {
        var count = 0,
            getNTData = plot.chains.getNTData();
        $.each(plot.chains(), function(_, chain) {
          count += getNTData(chain).length;
        });
        return count;
      };
    },

    actions: function(plot) {
      plot.nucleotides.visible('A', 'C', 'G', 'U');

      // TODO: Use d3.selectAll().filter()
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

Rna2D.components.zoom = (function() {

  var zoom, 
      translation = 0;

  return {
    config: function() {
      return {
        scaleExtent: [1, 10],
        currentScale: 1,
        onChange: Object
      };
    },

    generate: function(plot) {
      zoom = d3.behavior.zoom()
        .x(plot.xScale())
        .y(plot.yScale())
        .scaleExtent(plot.zoom.scaleExtent())
        .on("zoom", function() {
          var scale = d3.event.scale,
              translate = d3.event.translate;

          plot.zoom.currentScale(scale);
          plot.zoom.onChange()();

          // What I am trying to do here is to ensure that as we zoom out we
          // always return to having the upper left corner in the upper left.
          // This is done by undoing all translations so far.
          if (scale === 1) {
            translate = -translation;
            translation = 0;
          } else {
            translation += translate;
          }
          // TODO: Consider using a spring like forcing function.
          // This would cause the screen to snap back to the correct position
          // more sharply. This could feel nice.

          plot.vis.attr("transform", "translate(" + translate + ")" +
                        "scale(" + scale + ")");
        });

      plot.vis.call(zoom);
    }
  };
}());
Rna2D.views.airport = function(plot) {

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

  // We make a chart function which draws the nucleotides in the given
  // coordinates.
   var coordinates = function(standard) {

    // Draw the nucleotides
    plot.vis.selectAll(plot.chains['class']())
      .append('g')
      .data(plot.chains()).enter()
        .append('g')
        .attr('id', plot.chains.getID())
        .attr('class', plot.chains['class']())
        .selectAll(plot.nucleotides['class']())
        .data(plot.chains.getNTData()).enter()
          .append('svg:text')
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
      .enter()
        .append('svg:line')
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
            right = Number.MAX_VALUE,
            top = Number.MAX_VALUE,
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
        // involves the max number value. In this case we think that we have not
        // actually found the nts so we log this and use a box that cannot be
        // seen. This prevents bugs where we stop drawing boxes too early.
        if (bottom === 0 || left === 0 || right === Number.MAX_VALUE || top === Number.MAX_VALUE) {
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
    domain: function() {

      // Compute the max and min of x and y coords for the scales.
      var xMax = 0,
          yMax = 0;

      $.each(plot.chains(), function(_, chain) {
        var getX = plot.nucleotides.getX(),
            getY = plot.nucleotides.getY();
        $.each(plot.chains.getNTData()(chain), function(_, nt) {
          var x = getX(nt),
              y = getY(nt);

          if (x > xMax) {
            xMax = x;
          }
          if (y > yMax) {
            yMax = y;
          }
        });
      });

      return { x: [0, xMax], y: [0, yMax] };
    },

    config: {
      fontSize: 11,
      gap: 1,
      xCoord: function(d, i) { return plot.xScale()(plot.nucleotides.getX()(d, i)); },
      yCoord: function(d, i) { return plot.yScale()(plot.nucleotides.getY()(d, i)); }
    },
    connections: connections,
    coordinates: coordinates,
    groups: groups,
    sideffects: function() {
      plot.interactions.highlight(function(d, i) {
        var highlightColor = plot.interactions.highlightColor()(d, i);
        d3.select(this).style('stroke', highlightColor);
        return plot.interactions.nucleotides(this).style('stroke', highlightColor);
      });

      plot.interactions.normalize(function() {
        d3.select(this).style('stroke', null);
        return plot.interactions.nucleotides(this).style('stroke', null);
      });

      plot.nucleotides.highlight(function(d, i) {
        var highlightColor = plot.nucleotides.highlightColor()(d, i);
        d3.select(this).style('stroke', highlightColor);
        return plot.nucleotides.interactions(d, i)
          .style('stroke', highlightColor);
      });

      plot.nucleotides.normalize(function(d, i) {
        d3.select(this).style('stroke', null);
        return plot.nucleotides.interactions(d, i)
          .style('stroke', null);
      });

      plot.motifs.highlight(function(d, i) {
        var highlightColor = plot.motifs.highlightColor();
        return plot.motifs.nucleotides(this).style('stroke', highlightColor(d, i));
      });

      plot.motifs.normalize(function(d, i) {
        return plot.motifs.nucleotides(this).style('stroke', null);
      });

    }
  };

};

Rna2D.views.circular = function(plot) {

  // We use the total count in a couple places.
  var ntCount;

  // This is used to track some index values and the like
  var computed = {};

  // Used to compute the centroid of a nucleotide on the backbone.
  var ntCentroid;

  // Function to generate arcs for both the nucleotides and finding centriods
  // for interactions
  var arcGenerator = function(inner, outer) {
    var chainCount = plot.chains().length,
        angleSize = (2*Math.PI - plot.views.circular.arcGap() - 
                    (chainCount - 1) * plot.views.circular.chainBreakSize()) / ntCount,
        offset = plot.views.circular.arcGap() / 2,
        getNTData = plot.chains.getNTData();

    return $.map(plot.chains(), function(chain, chainIndex) {
      var startAngle = (function(shift) { 
            return function(_, i) { return i * angleSize + shift; };
          }(offset)),
          endAngle = (function(shift) {
            return function(_, i) { return (i + 1) * angleSize + shift; };
          }(offset));

      offset += (chainIndex + 1) * plot.views.circular.chainBreakSize() + 
        angleSize * getNTData(chain).length;

      return d3.svg.arc()
        .innerRadius(inner)
        .outerRadius(outer)
        .startAngle(startAngle)
        .endAngle(endAngle);
    });
  };

  // This is a function to compute all the things we need to draw, such as
  // global index, index in chain, etc.
  var globalIndex = 0;
  var preprocess = function() {
    var getNTData = plot.chains.getNTData(),
        idOf = plot.nucleotides.getID();

    $.each(plot.chains(), function(chainIndex, chain) {
      $.each(getNTData(chain), function(ntIndex, nt) {
        var id = idOf(nt);
        computed[id] = {
          globalIndex: globalIndex,
          chainIndex: chainIndex,
          ntIndex: ntIndex
        };
        globalIndex++;
      });
    });
  };

  // Function to draw the arcs.
  var coordinates = function(standard) {

    ntCount = plot.nucleotides.count();

    var idOf = plot.nucleotides.getID(),
        center = plot.views.circular.center()(),
        radius = plot.views.circular.radius()(),
        outerArcs = arcGenerator(radius - plot.views.circular.width(), radius),
        arcFor = function(d, i) { return outerArcs[computed[idOf(d)].chainIndex]; };

    ntCentroid = function(d, i) {
      return arcFor(d, i).centroid(d, i);
    };

    // Draw the arcs
    plot.vis.selectAll(plot.chains['class']())
      .append('g')
      .data(plot.chains()).enter()
        .append('g')
        .attr('id', plot.chains.getID())
        .attr('class', plot.chains['class']())
        .attr('transform', 'translate(' + center.x + ',' + center.y + ')')
        .selectAll(plot.nucleotides['class']())
        .data(plot.chains.getNTData()).enter()
          .append('svg:path')
          .attr('d', function(d, i) {
            return arcFor(d, i)(d, i);
          })
          .attr('fill', plot.nucleotides.color())
          .call(standard);

    return plot;
  };

  // Function to draw all connections.
  var connections = function(standard) {

    // Arc generator for finding the centroid of the nucleotides on the inner
    // circle, which has the interaction endpoints.
    var outerArcInnerRadius = plot.views.circular.radius()() - plot.views.circular.width(),
        innerArcInnerRadius = outerArcInnerRadius - plot.views.circular.interactionGap(),
        innerArcs = arcGenerator(innerArcInnerRadius, outerArcInnerRadius),
        arcFor = function(id) { return innerArcs[computed[id].chainIndex]; },
        startAngleOf = function(id) { return arcFor(id).startAngle()(null, computed[id].ntIndex); },
        centroidOf = function(id) { return arcFor(id).centroid(null, computed[id].ntIndex); };

    // Figure out the centroid position of the nucleotide with the given id in
    // the innerArc.
    var centriodPosition = function(ntID) {
      var centroid = centroidOf(ntID),
          c = plot.views.circular.center()();
      return { x: c.x + centroid[0], y: c.y + centroid[1] };
    };

    // A function to sort nucleotide ids based upon their index amoung all
    // nucleotides. This is used to draw arcs correctly.
    var sortFunc = function(nt1, nt2) {
      var i1 = computed[nt1].globalIndex,
          i2 = computed[nt2].globalIndex;
      return (Math.abs(i1 - i2) > ntCount/2) ? (i2 - i1) : (i1 - i2);
    };

    var curve = function(d, i) {

      // The idea is to sort the nts such that we are always drawing from lower to
      // higher nts, unless we are drawing from one half to the other half, in
      // which case we flip the order. This lets us always use the sweep and arc
      // flags of 0,0. The code is kinda gross but it works.
      var nts = plot.interactions.getNTs()(d, i).sort(sortFunc),
          from = centriodPosition(nts[0]),
          to = centriodPosition(nts[1]),
          angleDiff = startAngleOf(nts[0]) - startAngleOf(nts[1]),
          radius = Math.abs(innerArcInnerRadius * Math.tan(angleDiff/2));

      return "M "  + from.x + " " + from.y +  // Start point
        " A " + radius + "," + radius +       // Both radi are the same for a circle
        " 0 0,0 " +                           // Rotation and arc flags are always 0
        to.x + "," + to.y;                    // End point
    };

    return plot.vis.selectAll(plot.interactions['class']())
      .data(plot.interactions.valid()).enter().append('path')
      .call(standard)
      .attr('d', curve)
      .attr('fill', 'none')
      .attr('stroke', plot.interactions.color());
  };

  return {

    preprocess: preprocess,
    domain: function() { return { x: [0, 1000], y: [0, 1000] }; },
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
        return ntCentroid(d, i).x;
      },
      yCoord: function(d, i) {
        return ntCentroid(d, i).y;
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
            centriodPosition = ntCentroid(null, index),
            center = plot.views.circular.center()();
        return { x: center.x + centriodPosition[0], y: center.y + centriodPosition[1] };
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
          .text(plot.nucleotides.getSequence())
          .attr('fill', highlightColor);

        return plot;
      },
      clearLetters: function() {
        return plot.vis.selectAll('.' + plot.views.circular.letterClass()).remove();
      },
      chainBreakSize: 0.1
    },

    sideffects: function() {

      plot.nucleotides.highlight(function(d, i) {
        var highlightColor = plot.nucleotides.highlightColor()(d, i);

        d3.select(this)
          .style('stroke', highlightColor)
          .style('fill', highlightColor);

        plot.views.circular.addLetters()([d]);

        return plot.nucleotides.interactions(d, i)
          .style('stroke', highlightColor);
      });

      plot.nucleotides.normalize(function(d, i) {
        d3.select(this)
          .style('stroke', null)
          .style('fill', null);
        plot.views.circular.clearLetters()();
        return plot.nucleotides.interactions(d, i)
          .style('stroke', null);
      });

      plot.interactions.highlight(function(d, i) {
        var highlightColor = plot.interactions.highlightColor()(d, i),
            nts = plot.interactions.nucleotides(d, i);

        d3.select(this).style('stroke', highlightColor);
        plot.views.circular.addLetters()(nts[0]); // TODO: WTF?

        return nts
          .style('stroke', highlightColor)
          .style('fill', highlightColor);
      });

      plot.interactions.normalize(function(d, i) {
        d3.select(this).style('stroke', null);
        plot.views.circular.clearLetters()();
        plot.interactions.nucleotides(this)
          .style('stroke', null)
          .style('fill', null);
        return plot.interactions;
      });
    }
  };

};


}());
