(function() {
  'use strict';

var Rna2D = window.Rna2D || function(config) {
  var plot = function(selection) {

    // Set the selection to the given one.
    if (selection) {
      plot.selection(selection);
    }

    d3.select(plot.selection()).call(function(sel) {

      // Compute the nucleotide ordering. This is often used when drawing
      // interactions.
      plot.nucleotides.computeOrder();

      plot.vis = sel.append('svg')
        .attr('width', plot.width())
        .attr('height', plot.height());

      // ----------------------------------------------------------------------
      // Draw all coordinates and attach all standard data
      // ----------------------------------------------------------------------
      plot.coordinates(function(selection) {

        console.log('hi');
        selection.attr('id', plot.nucleotides.getID())
          .attr('class', function(d, i) {
            return plot.nucleotides['class']() + ' ' + plot.nucleotides.classOf()(d, i);
          });

        Rna2D.utils.attachHandlers(selection, plot.nucleotides);

        return selection;
      });

      // ----------------------------------------------------------------------
      // Draw all interactions and add all common data
      // ----------------------------------------------------------------------
      plot.connections(function(selection) {
        var ntsOf = plot.interactions.getNTs(),
            visible = plot.interactions.show();

        selection.attr('id', plot.interactions.getID())
          .attr('class', function(d, i) {
            return plot.interactions['class']() + ' ' + plot.interactions.classOf()(d, i);
          })
          .attr('visibility', function(d) { return (visible(d) ? 'visible' : 'hidden'); })
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
          .attr('visibility', function(d) { return (d.visible ? 'visible' : 'hidden'); });

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

  // Setup the view
  Rna2D.views(plot, config);

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

    if ('self' in obj) {
      plot[name] = function() {
        obj.self.apply(this, arguments);
        return plot[name];
      };
    } else {
      plot[name] = {};
    }

    Rna2D.utils.generateAccessors(plot[name], obj.config);

    if ('sideffects' in obj) {
      obj.sideffects(plot);
    }

    plot.components[name] = function(plot) {
      if ('actions' in obj) {
        obj.actions(plot);
      }

      if ('generate' in obj) {
        obj.generate(plot);
      }

      return plot;
    };
  }

  return Rna2D;
};

Rna2D.config = function(plot, given) {

  var config = { 
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

      obj[key] = function(x) {
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

    });
  };

  my.attachHandlers = function(selection, obj) {
    (['mouseover', 'mouseout', 'click']).forEach(function(handler) {
      if (obj[handler]) {
        selection.on(handler, obj[handler]);
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

// Stores the views of the structure
Rna2D.views = function(plot, config) {

  var name = plot.view(),
      view = Rna2D.views[name];

  view.coordinates(plot, config);
  view.connections(plot, config);
  view.groups(plot, config);

  return Rna2D;
}

// TODO: Organize so we don't have to add this silly setup.
// Some builtin views.
Rna2D.views.airport = {};
Rna2D.views.circular = {};

Rna2D.components.brush = function() {

  var brush = null;

  return {

    self: function(x) {
      if (!arguments.length) return brush;
      brush = x;
      return brush;
    },

    actions: function(plot) {
      // Draw the brush around the given extent
      plot.brush.select = function(extent) {
        plot.brush().extent(extent);
        plot.brush()(plot.selection());
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

    config: {
      enabled: true,
      initial: [],
      'class': 'brush',
      update: Object,
      clear: Object
    },

    generate: function(plot) {
      var brush = d3.svg.brush()
        .on('brushstart', startBrush)
        .on('brush', updateBrush)
        .on('brushend', endBrush)
        .x(plot.xScale())
        .y(plot.yScale());

      plot.brush(brush);

      // Blank for now, later may use this for a multiple selecting brush.
      var startBrush = function () { };

      // Do nothing for now.
      var updateBrush = function (p) { };

      var endBrush = function () {
        var matched = {};

        if (brush.empty()) {
          plot.brush.clear();
        } else {

          var e = plot.brush().extent();
          plot.vis.selectAll('.' + plot.nucleotides['class']())
            .attr("checked", function(d) {
              if (e[0][0] <= d.x && d.x <= e[1][0] &&
                  e[0][1] <= d.y && d.y <= e[1][1]) {
                matched[d.id] = d;
              }
            });

          plot.brush.update()(matched);
        }
      };

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
    };

    return plot.vis.append('svg:rect')
      .classed(plot.frame.class(), true)
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', plot.width())
      .attr('height', plot.height() - 1)
      .style('pointer-events', 'none');
  },
};

//Rna2D.components.frame = function(plot) {

  //plot.components.frame = function() {

    //// Draw a frame around the plot as needed
    //if (plot.frame.add()) {
      //plot.vis.append('svg:rect')
        //.classed(plot.frame.class(), true)
        //.attr('x', 0)
        //.attr('y', 0)
        //.attr('width', plot.width())
        //.attr('height', plot.height() - 1)
        //.style('pointer-events', 'none');
    //};
  //}

  //plot.frame = {};

  //// Frame configuration options
  //var config = {
    //add: true,
    //'class': 'frame'
  //};
  //Rna2D.utils.generateAccessors(plot.frame, config);

  //return Rna2D;
//}

Rna2D.components.interactions = function () {

  var interactions = [];

  return {
    self: function(x) {
      if (!arguments.length) return interactions;
      interactions = x;
      return interactions;
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
            seen = [],
            orderedNts = plot.nucleotides.ordered();

        for(var i = 0; i < interactions.length; i++) {
          var current = interactions[i],
              id = getID(current, i),
              nts = getNts(current);

          if (isForward(current) && !seen[id] && nts.length &&
              nts[0] in orderedNts && nts[1] in orderedNts) {
            seen[id] = true;
            valid.push(current);
          }
        }

        return valid;
      };
    },

    config: {
      getFamily: function(d) { return d.family; },
      getNTs: function(d) { return [d.nt1, d.nt2]; },
      show: function(d) { return plot.interactions.getFamily()(d) == 'cWW'; },
      mouseover: null,
      mouseout: null,
      click: null,
      'class': 'interaction',
      classOf: function(d) { return d.family; },
      higlight: Object,
      isForward: function(d) {
        var getFamily = plot.interactions.getFamily(),
            family = getFamily(d);
        if (family.length == 3) {
          family = family.slice(1, 3).toUpperCase();
        } else {
          family = family.slice(2, 4).toUpperCase();
        }
        return family == 'WW' || family == 'WH' || family == 'WS' ||
               family == 'HH' || family == 'HS' || family == 'SS';
      },
      getID: function(d) {
        var family = plot.interactions.getFamily()(d),
            nts = plot.interactions.getNTs()(d);
        if (plot.interactions.isSymmetric()(d)) {
          nts.sort();
        }
        return nts.join(',') + ',' + family;
      },
      color: function(d, i) { return 'black'; }
    },

    actions: function(plot) {
      plot.interactions.all = function(family) {
        if (!arguments.length || !family) {
          family = plot.interactions['class']();
        }
        return plot.vis.selectAll('.' + family);
      };

      plot.interactions.family = function(obj) {
        return obj.getAttribute('id').split(',')[2];
      };

      plot.interactions.nucleotides = function(obj) {
        // TODO: Can this be done with getElementById? Will it be faster?
        var nts = [obj.getAttribute('nt1'), obj.getAttribute('nt2')];
        var selector = '#' + nts.join(', #');
        return plot.vis.selectAll(selector);
      };

      plot.interactions.show =  function(family) {
        return plot.interactions.all(family).attr('visibility', function(data) {
          data.visibility = true;
          return 'visible';
        });
      };

      plot.interactions.hide = function(family) {
        return plot.interactions.all(family).attr('visibility', function(data) {
          data.visibility = false;
          return 'hidden';
        });
      };

      plot.interactions.toggle = function(family) {
        return plot.interactions.all(family).attr('visibility', function(data) {
          if (data.visibility) {
            data.visibility = false;
            return 'hidden';
          }
          data.visibility = true;
          return 'visible';
        });
      };
    }
  };

}();

Rna2D.components.jmol = function(plot, config) {

  plot.jmol = { show: {} };

  var setup = function() {
    var $app = $('#' + plot.jmol.appID()),
        $div = $('#' + plot.jmol.divID());

    // launch jmol if necessary
    if ($app.length == 0 ) {
      $div.html(jmolApplet(plot.jmol.windowSize(), "", 0))
      plot.jmol.windowBuild()($div);
      $div.show();
    };

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
  };

  // Display a selection.
  plot.jmol.selection = function(matched) {
    setup();

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
      showStereoId: plot.jmol.stereoID(),
    }).jmolToggle();
  };

  // Show the given group. The group should have a data-nts property which is
  // a string of nt ids to show.
  plot.jmol.group = function(group) {
    if (!arguments.length || !group) group = this;
    plot.jmol.selection(group['data-nts']);
  };

  plot.components.jmol = function() {
    return plot;
  };

  // --------------------------------------------------------------------------
  // jmolTools configuration options
  // --------------------------------------------------------------------------
  (function(given) {
    var jmolConfig = given.jmol || {},
        jmolId = jmolConfig.id || 'jmol',
        jmolAppId = jmolConfig.jmolAppId || 'jmolApplet0',
        jmolTmpId = jmolConfig.jmolTmpId || 'tempJmolToolsObj',
        neighborhoodId = jmolConfig.neighborhood || 'neighborhood',
        numbersId = jmolConfig.numbersId || 'showNtNums',
        stereoId = jmolConfig.stereoId || 'stero',
        max = jmolConfig.max || 200,
        overflow = jmolConfig.overflow || Object,
        windowSize = jmolConfig.windowSize || 400,
        windowBuild = jmolConfig.windowBuild || function($div) {
          $div.append('<label><input type="checkbox" id="showNtNums">Numbers</label>')
            .append('<input type="button" id="neighborhood" value="Show neighborhood">')
            .append('<input type="button" id="stereo" value="Stereo">');
        };

    plot.jmol.maxSize = function(_) {
      if (!arguments.length) return max;
      max = _;
      return plot;
    };

    plot.jmol.overflow = function(_) {
      if (!arguments.length) return overflow;
      overflow = _;
      return plot;
    };

    plot.jmol.windowSize = function(_) {
      if (!arguments.length) return windowSize;
      windowSize = _;
      return plot;
    };

    plot.jmol.windowBuild = function(_) {
      if (!arguments.length) return windowBuild;
      windowBuild = _;
      return plot;
    };

    plot.jmol.divID = function(_) {
      if (!arguments.length) return jmolId;
      divID = _;
      return plot;
    };

    plot.jmol.appID = function(_) {
      if (!arguments.length) return jmolAppId;
      jmolAppId = _;
      return plot;
    };

    plot.jmol.tmpID = function(_) {
      if (!arguments.length) return jmolTmpId;
      jmolTmpId = _;
      return plot;
    };

    plot.jmol.neighborhoodID = function(_) {
      if (!arguments.length) return neighborhoodId;
      neighborhoodId = _;
      return plot;
    };

    plot.jmol.numbersID = function(_) {
      if (!arguments.length) return numbersId;
      numbersId = _;
      return plot;
    };

    plot.jmol.stereoID = function(_) {
      if (!arguments.length) return stereoId;
      stereoId = _;
      return plot;
    };

  })(config);

  return Rna2D;
};
Rna2D.components.motifs = function () {

  var motifs = [];

  return {
    self: function(x) {
        if (!arguments.length) return motifs;
        motifs = x;
        return motifs;
    },

    config: {
      classOf: function(d) { return d.id.split("_")[0]; },
      'class': 'motif',
      highlightColor: 'red',
      visible: function(d) { return true; },
      click: null,
      mouseover: null,
      mouseout: null,
      getID: function(d) { return d.id; },
      getNTs: function(d) { return d.nts; }
    },

    actions: function(plot) {
      plot.motifs.all = function() {
        return plot.vis.selectAll('.' + config.motif['class']());
      };

      plot.motifs.nucleotides = function(obj) {
        var nts = obj.getAttribute('data-nts').split(',');
        var selector = '#' + nts.join(', #');
        return plot.vis.selectAll(selector);
      };

      plot.motifs.show = function() {
        // return all().attr('visibility', 'visible');
      };

      plot.motifs.hide = function() {
      };

      plot.motifs.toggle = function() {
      };

      plot.motifs.highlight = function() {
        return plot.motifs.nucleotides(this).style('stroke', config.motif.highlightColor());
      };

      plot.motifs.normalize = function() {
        return plot.motifs.nucleotides(this).style('stroke', null);
      };
    }

    //         show: function() {
    //           config.motif.visible = true;
    //           return all().attr('visibility', 'visible');
    //         },

    //         hide: function() {
    //           config.motif.visible = false;
    //           return all().attr('visibility', 'hidden');
    //         },

    //         toggle: function() {
    //           if (config.motif.visible) {
    //             return plot.motifs.hide();
    //           };
    //           return plot.motifs.show();
    //         },

    //plot.motifs.all = function(family) {
      //if (!arguments.length || !family) family = plot.motifs.class();
      //return plot.vis.selectAll('.' + family);
    //};

    //plot.motifs.nucleotides = function(obj) {
      //var nts = obj.getAttribute('data-nts').split(',');
      //var selector = '#' + nts.join(', #');
      //return d3.selectAll(selector);
    //};

    //plot.motifs.show = function(family) {
      //return plot.motifs.all(family)
        //.attr('visibility', function(d) {
          //d.visible = true;
          //return 'visible';
        //});
    //};

    //plot.motifs.hide = function(family) {
      //return plot.motifs.all(family)
        //.attr('visibility', function(d) {
          //d.visible = false;
          //return 'hidden';
        //});
    //};

    //plot.motifs.toggle = function(family) {
      //return plot.motifs.all(family)
        //.attr('visibility', function(d) {
          //d.visible = !d.visible;
          //if (d.visible == false) {
            //return 'hidden';
          //};
          //return 'visible';
        //});
    //};
  };

}();

Rna2D.components.nucleotides = function() {

  var ordered = {},
      nts = [];

  return {

    self: function(x) {
      if (!arguments.length) return nts;
      nts = x;
      return nts;
    },

    config: {
      highlightColor: 'red',
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
      getSequence: function(d) { return d.sequence; }
    },

    sideffects: function(plot) {
      plot.nucleotides.computeOrder = function() {
        var nts = plot.nucleotides(),
            getID = plot.nucleotides.getID();
        for(var i = 0; i < nts.length; i++) {
          ordered[getID(nts[i])] = i;
        }
      };

      plot.nucleotides.indexOf = function(ntId) {
        return ordered[ntId];
      };

      plot.nucleotides.ordered = function(_) {
        if (!arguments.length) return ordered;
        ordered = _;
        return plot;
      };
    },

    actions: function(plot) {
      plot.nucleotides.all = function() {
        return plot.vis.selectAll('.' + plot.nucleotide['class']());
      };

      plot.nucleotides.interactions = function(obj) {
        if (!arguments.length) obj = this;
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
    };

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

      console.log(plot.interactions().length);
      console.log(plot.interactions.valid().length);
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
      plot.vis.selectAll(plot.interactions.class())
        .data(interactions)
        .enter().append('svg:line')
        .call(standard)
        .attr('stroke', plot.interactions.color())
        .attr('x1', function(d) { return d.line.x1; })
        .attr('y1', function(d) { return d.line.y1; })
        .attr('x2', function(d) { return d.line.x2; })
        .attr('y2', function(d) { return d.line.y2; })

    return plot;
  };

  plot.interactions.highlight = function() {
    var obj = this;
    d3.select(obj).style('stroke', plot.interactions.highlightColor());
    return plot.interactions.nucleotides(obj).style('stroke', plot.interactions.highlightColor())
  };

  plot.interactions.normalize = function() {
    var obj = this;
    d3.select(obj).style('stroke', null);
    return plot.interactions.nucleotides(obj).style('stroke', null);
  };

  return Rna2D;
};

Rna2D.views.airport.coordinates = function(plot) {

  // We make a chart function which draws the nucleotides in the given
  // coordinates.
  plot.coordinates = function(standard) {

    var data = plot.nucleotides(),
        width = plot.width(),
        height = plot.height()
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
    plot.vis.selectAll(plot.nucleotides.class())
      .data(data).enter().append('svg:text')
      .call(standard)
      .attr('x', function(d, i) { return xScale(plot.nucleotides.getX()(d, i)); })
      .attr('y', function(d, i) { return yScale(plot.nucleotides.getY()(d, i)); })
      .attr('font-size', plot.nucleotides.fontSize())
      .text(plot.nucleotides.getSequence())
      .attr('fill', plot.nucleotides.color())

    return plot;
  };

  plot.nucleotides.highlight = function() {
    var obj = this;
    d3.select(obj).style('stroke', plot.nucleotides.highlightColor());
    return plot.nucleotides.interactions(obj).style('stroke', plot.nucleotides.highlightColor());
  };

  plot.nucleotides.normalize = function() {
    var obj = this;
    d3.select(obj).style('stroke', null);
    return plot.nucleotides.interactions(obj).style('stroke', null);
  };

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
      plot.vis.selectAll(plot.motifs.class())
        .data(plot.motifs()).enter().append('svg:path')
        .call(standard)
        .attr('d', function(d) { return motifLine(d.bounding) + "Z" })

     return plot;
  };

  plot.motifs.highlight = function() {
    var obj = this;
    return plot.motifs.nucleotides(obj).style('stroke', plot.motifs.highlightColor());
  };

  plot.motifs.normalize = function() {
    var obj = this;
    return plot.motifs.nucleotides(obj).style('stroke', null);
  };

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
          radius = Math.abs(angleDiff) * distance;

      return "M "  + from.x + " " + from.y +     // Start point
             " A " + radius + "," + radius +     // Radii of elpise
             " " + 0 +                           // Rotation
             " " + 0 + " " + 0 +                 // Large Arc and Sweep flag
             " " + to.x + "," + to.y;            // End point

    };

    plot.vis.selectAll(plot.interactions.class())
      .data(plot.interactions.valid()).enter().append('path')
      .call(standard)
      .attr('d', curve)
      .attr('fill', 'none')
      .attr('stroke', plot.interactions.color());

    return plot;
  };

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

    plot.vis.selectAll(plot.nucleotides.class())
      .append('g')
      .data(plot.nucleotides()).enter().append('svg:path')
      .call(standard)
      .attr('d', arc)
      .attr('transform', 'translate(' + center.x + ',' + center.y + ')')
      .attr('fill', plot.nucleotides.color())

    plot.__ntArc = arc;
    plot.__circleCenter = center;
    // TODO: Fix scales
    plot.__xScale = d3.scale.linear()
      .domain([0, plot.width()])
      .range([-center.x, center.x + plot.width()])
    plot.__yScale = d3.scale.linear()
      .domain([0, plot.height()])
      .range([-center.x, center.y + plot.height()])

    return plot;
  };

  plot.pie = {};

  (function() {
    var width = 10,
        gap = 0.2;

    plot.pie.width = function(_) {
      if (!arguments.length) return width;
      width = _;
      return plot;
    };

    plot.pie.gapSize = function(_) {
      if (!arguments.length) return gap;
      gap = _;
      return plot;
    };
  })();

  return Rna2D;
};

Rna2D.views.circular.groups = function(plot) {
  plot.groups = function(standard) {
    return plot;
  };

  return Rna2D;
};

})();
