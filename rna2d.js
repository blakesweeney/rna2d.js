(function () {
  'use strict';
/*globals window, d3, document, $, jmolApplet, jmolScript */

var Rna2D = window.Rna2D || function(config) {

  var plot = function() {

    // Setup the drawing area
    var margin = plot.margin(),
        selection = d3.select(plot.selection());

    selection.select('svg').remove();
    var top = selection.append('svg')
      .attr('width', plot.width() + margin.left + margin.right)
      .attr('height', plot.height() + margin.above + margin.below);

    plot.vis = top.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.above + ")");

    // Generate the view
    var view = views.current();
    if (view) {
      var scale = function(domain, max) {
          return d3.scale.linear().domain(domain).range([0, max]);
        };

      view.preprocess();

      // Setup the scales
      plot.xScale(scale(view.xDomain(), plot.width() - margin.right));
      plot.yScale(scale(view.yDomain(), plot.height() - margin.above));

      // Generate the components - brush, frame, zoom, etc
      components.generate();

      view.generate();
    }

    return plot;
  };

  // Configure the plot
  Rna2D.utils.generateAccessors(plot, $.extend({
    labels: [],
    margin: { left: 10, right: 10, above: 10, below: 10 },
    view: 'circular',
    width:  500,
    height: 1000,
    selection: null,
    xScale: null,
    yScale: null
  }, config));

  // Add all components and views.
  var components = new Rna2D.Components(),
      views = new Rna2D.Views();

  components.attach(plot);
  views.attach(plot);

  return plot;
};

// Some namespaces.
Rna2D.views = {};
Rna2D.components = {};

window.Rna2D = Rna2D;

function Component(name, config) {
  this._name = name;
  this._parent = Component;

  if (!config.hasOwnProperty('render')) {
    config.render = true;
  }
  Rna2D.utils.generateAccessors(this, config);
}

Component.prototype.attach = function(plot) {

  this.plot = plot;

  (function(prop) {
    var data = null;
    plot[prop] = function(x) {
      if (!arguments.length) {
        return data;
      }
      data = x;
      return plot[prop];
    };
  }(this._name));

  // Mixin all properties
  var prop;
  for(prop in this) {
    if (this.hasOwnProperty(prop) && prop[0] !== '_') {
      plot[this._name][prop] = this[prop];
    }
  }
};

Component.prototype.generate = function() {
  if (!this.draw) {
    return false;
  }

  if (!this.plot) {
    console.log("Must setup " + this._name + " component prior to drawing");
    return false;
  }

  try {
    return (this.render() ? this.draw() : false);
  } catch (except) {
    console.log("Could not generate component: " + this._name);
    console.log(except);
  }
};

Rna2D.Component = Component;

function inhert(klass, name, options) {

  function Type() {
    klass.call(this, name, options);
  }

  Type.prototype = new klass(name, options);
  Type.prototype.constructor = Type;

  return Type;
}

Rna2D.withIdElement = function() {
  var self = this;
  this.elementID = function() {
    var getID = self.getID(),
        encodeID = self.encodeID();
    return function(d, i) {
      return encodeID(getID(d, i));
    };
  };
};

Rna2D.withNTElements = function(plot) {
  var self = this;
  this.ntElements = function() {
    var getNTs = self.getNTs(),
        encodeID = plot.nucleotides.encodeID();
    return function(d, i) {
      return $.map(getNTs(d, i), encodeID);
    };
  };

  this.nucleotides = function(d, i) {
    var nts = self.getNTs()(d, i),
        idOf = plot.nucleotides.getID();
    return plot.vis.selectAll('.' + plot.nucleotides['class']())
      .filter(function(d, i) { return $.inArray(idOf(d, i), nts) !== -1; });
  };
};

Rna2D.withInteractions = function(plot) {
  var self = this;

  this.interactions = function(d, i) {
    var id = self.getID()(d, i),
        getNTs = plot.interactions.getNTs();
    return plot.vis.selectAll('.' + plot.interactions['class']())
      .filter(function(d, _) { return $.inArray(id, getNTs(d)) !== -1; });
  };
};

Rna2D.asToggable = function(plot) {
  var type = this;

  type.all = function(klass) {
    klass = (klass && klass !== 'all' ? klass : type['class']());
    return plot.vis.selectAll('.' + klass);
  };

  type.visibility = function() {
    var isVisible = type.visible();
    return function(d, i) {
      return (isVisible(d, i) ? 'visible' : 'hidden'); };
  };

  type.updateVisibility = function() {
    type.all().attr('visibility', type.visibility());
  };
};

Rna2D.asColorable = function() {
  var self = this;
  this.colorize = function() {
    return self.all().attr('fill', self.color());
  };
};

function Components() {
  this._components = {};
  this._namespace = Rna2D.components;
}

Components.prototype.register = function(name, comp) {
  this._components[name] = comp;
};

Components.prototype.generate = function() {
  $.each(this._components, function(name, comp) { comp.generate(); });
};

Components.prototype.attach = function(plot) {
  var container = this;
  this._plot = plot;
  $.each(container._namespace, function(name, fn) {
    var component = fn(plot);
    container.register.call(container, component._name, component);
  });
};

Rna2D.Components = Components;

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

// TODO: Inhert from component
function View(name, config) {
  this._name = name;
  this.domain = { x: null, y: null };
  Rna2D.utils.generateAccessors(this, config);
}

View.prototype = {
  attach: function(plot) {

    plot[this._name] = {};

    this.plot = plot;

    var prop;
    for(prop in this) {
      if (this.hasOwnProperty(prop) && prop[0] !== '_') {
        plot[this._name][prop] = this[prop];
      }
    }
  },

  generate: function(){
    this.update();
    this.coordinates();
    this.connections();
    this.groups();
    this.labels();
  },

  drawStandard: function(type) {
    return function(selection) {
      var klass = type['class'](),
          classOf = type.classOf();

      Rna2D.utils.attachHandlers(selection, type);

      return selection.attr('id', type.elementID())
        .attr('class', function(d, i) {
          return classOf(d, i).concat(klass).join(' ');
        })
        .attr('visibility', type.visibility());
    };
  },

  standardCoordinates: function() {
    var self = this;
    return function(selection) {
      var x = self.xCoord(),
          y = self.yCoord();

      return self.drawStandard(self.plot.nucleotides)(selection)
        .datum(function(d, i) {
          d.__x = x(d, i);
          d.__y = y(d, i);
          return d;
        });
    };
  },

  standardConnections: function() {
    return this.drawStandard(this.plot.interactions);
  },

  standardGroups: function() {
    return this.drawStandard(this.plot.motifs);
  },

  standardLabels: function() {
    return this.drawStandard(this.plot.labels);
  },

  xDomain: function() { return this.domain.x; },

  yDomain: function() { return this.domain.y; },

  labels: function() { return false; },
  xCoord: function() { return false; },
  yCoord: function() { return false; },
  update: function() { return false; },
  groups: function() { return false; },
  preprocess: function() { return false; },
  coordinates: function() { return false; },
  connections: function() { return false; },
};

Rna2D.View = View;

function Views() { 
  Components.call(this);
  this._namespace = Rna2D.views;
}

Views.prototype = new Components();
Views.prototype.constructor = Views;

Views.prototype.current = function() {
  var plot = this._plot,
      name = plot.view();

  if (!this._components.hasOwnProperty(name)) {
    console.log("Unknown view " + plot.view());
    return false;
  }

  return this._components[name];
};

Rna2D.Views = Views;

Rna2D.components.brush = function(plot) {

  var Brush = inhert(Rna2D.Component, 'brush', {
    enabled: true,
    'class': 'brush',
    update: Object,
    clear: Object
  });

  Brush.prototype.enable = function() {
    plot.vis.append('g')
      .classed(plot.brush['class'](), true)
      .call(plot.brush());
    this.enabled(true);
    return this;
  };

  Brush.prototype.disable = function() {
    plot.vis.selectAll('.' + plot.brush['class']()).remove();
    this.enabled(false);
    return this;
  };

  Brush.prototype.toggle = function() {
    return (this.enabled() ? this.disable() : this.enable());
  };

  Brush.prototype.draw = function() {

    var scale = function(given) {
        return d3.scale.identity().domain(given.domain());
      }, 
      brush = d3.svg.brush()
        .x(scale(plot.xScale()))
        .y(scale(plot.yScale()));

    brush.on('brushend', function () {
      var nts = [],
          extent = brush.extent();

      if (brush.empty()) {
        return plot.brush.clear()();
      }

      plot.vis.selectAll('.' + plot.nucleotides['class']())
        .attr("selected", function(d) {
          if (extent[0][0] <= d.__x && d.__x <= extent[1][0] &&
              extent[0][1] <= d.__y && d.__y <= extent[1][1]) {
            nts.push(d);
            return 'selected';
          }
          return '';
        });

      return plot.brush.update()(nts);
    });

    plot.brush(brush);

    if (this.enabled()) {
      this.enable();
    }

    return this;
  };

  var brush = new Brush();
  brush.attach(plot);

  return brush;
};

Rna2D.components.chains = function(plot) {

  var Chains = inhert(Rna2D.Component, 'chains', {
    getID: function(d, i) { return d.id; },
    'class': 'chain',
    classOf: function(d, i) { return []; },
    getNTData: function(d, i) { return d.nts; },
    chainOf: function(d, i) {
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
    }
  });

  var chain = new Chains();
  chain.attach(plot);

  return chain;
};

Rna2D.components.frame = function(plot) {
  var Frame = inhert(Rna2D.Component, 'frame', { add: true, 'class': 'frame' });

  Frame.prototype.draw = function() {
    return plot.vis.append('svg:rect')
      .classed(plot.frame['class'](), true)
      .attr('x', -plot.margin().left)
      .attr('y', -plot.margin().above)
      .attr('width', plot.width() + plot.margin().left + plot.margin().right)
      .attr('height', plot.height() + plot.margin().above + plot.margin().below)
      .style('pointer-events', 'none');
  };

  var frame = new Frame();
  frame.attach(plot);

  return frame;
};

Rna2D.components.interactions = function(plot) {
  var Interactions = inhert(Rna2D.Component, 'interactions', {
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
    color: 'black',
    valid: function() {
      var getID = plot.interactions.getID(),
          getNts = plot.interactions.getNTs(),
          isForward = plot.interactions.isForward(),
          valid = [],
          seen = {},
          encodeID = plot.nucleotides.encodeID(),
          bboxOf = function (id) {
            return document.getElementById(encodeID(id));
          };

      $.each(plot.interactions(), function(i, current) {
        var id = getID(current),
            nts = getNts(current);

        if (isForward(current) && !seen[id] && nts.length &&
            bboxOf(nts[0]) !== null && bboxOf(nts[1]) !== null) {
          seen[id] = true;
          valid.push(current);
        }
      });

      return valid;
    },
    visible: function(d, i) {
      var getFamily = plot.interactions.getFamily(),
          family = getFamily(d);
      return family === 'cWW' || family === 'ncWW';
    }
  });

  var interactions = new Interactions();
  Rna2D.withIdElement.call(interactions);
  Rna2D.withNTElements.call(interactions, plot);
  Rna2D.asToggable.call(interactions, plot);
  Rna2D.asColorable.call(interactions);

  interactions.attach(plot);

  return interactions;
};

Rna2D.components.jmol = function(plot) {

  var loaded = false,
      showNTGroup = function(type) {
        return function(d, i) {
          var numberOf = plot.nucleotides.getNumber(),
              chainOf = plot.nucleotides.getChain(),
              nts = type.nucleotides(d, i),
              data = [];

          nts.datum(function(d) {
            data.push({number: numberOf(d), chain: chainOf(d)});
            return d;
          });

          return plot.jmol.showNTs(data);
        };
      };

  var Jmol = inhert(Rna2D.Component, 'jmol', {
    divID: 'jmol',
    file: 'static/jmol/data/2AVY.pdb',
    showOnStartup: true,
    postSetup: Object,
    render: false,
    nucleotides: function(d, i) {
      var numberOf = plot.nucleotides.getNumber(),
          chainOf = plot.nucleotides.getChain();
      return plot.jmol.showNTs([{number: numberOf(d), chain: chainOf(d)}]);
    },
    interactions: showNTGroup(plot.interactions),
    motifs: showNTGroup(plot.motifs),
    brush: function(data) {
      var numberOf = plot.nucleotides.getNumber(),
          chainOf = plot.nucleotides.getChain();
      return plot.jmol.showNTs($.map(data, function(d) {
        return {number: numberOf(d), chain: chainOf(d)};
      }));
    },
  });

  Jmol.prototype.draw = function() {
    return (plot.jmol.showOnStartup() ? this.setup() : true);
  };

  var jmol = new Jmol();

  jmol.setup = function() {
    if (loaded) {
      return true;
    }

    jmolScript("load " + this.file() + ";");
    loaded = true;
    this.postSetup()();
    return true;
  };

  jmol.showNTs = function(ids) {
    var commands = [],
        ntSelect = [];

    $.each(ids, function(index, data) {
      ntSelect.push(data.number + ':' + data.chain);
    });

    ntSelect = ntSelect.join(' or ');
    commands.push('select ' + ntSelect + ';');
    commands.push('show ' + ntSelect + ';');

    return jmol.run(commands);
  };

  jmol.run = function(commands) {
    this.setup();

    if (typeof(commands) !== 'string') {
      commands = commands.join("\n");
    }

    return jmolScript(commands);
  };

  jmol.attach(plot);
  return jmol;

};

Rna2D.components.jmolTools = function(plot) {
  var jmolTools = inhert(Rna2D.Component, 'jmolTools', {
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
    },
    nucleotides: function(d, i) {
      var idOf = plot.nucleotides.getID();
      return plot.jmolTools.showNTs([idOf(d, i)]);
    },
    interactions: function(d, i) {
      var getNTs = plot.interactions.getNTs();
      return plot.jmolTools.showNTs(getNTs(d, i));
    },
    motifs: function(d, i) {
      var getNTs = plot.motifs.getNTs();
      return plot.jmolTools.showNTs(getNTs(d, i));
    },
    brush: function(nts) {
      var idOf = plot.nucleotides.getID(),
          ids = $.map(nts, idOf);
      return plot.jmolTools.showNTs(ids);
    }
  });

  var tool = new jmolTools();

  tool.setup = function() {
    var $app = $('#' + this.appID()),
        $div = $('#' + this.divID());

    // launch jmol if necessary
    if ($app.length === 0 ) {
      $div.html(jmolApplet(this.windowSize(), "", 0));
      this.windowBuild()($div);
      $div.show();
    }

    // reset the state of the system
    jmolScript('zap;');
    $.jmolTools.numModels = 0;
    $.jmolTools.stereo = false;
    $.jmolTools.neighborhood = false;
    $('#' + this.neighborhoodID()).val('Show neighborhood');
    $.jmolTools.models = {};

    // unbind all events
    $('#' + this.stereoID()).unbind();
    $('#' + this.neighborhoodID()).unbind();
    $('#' + this.numbersID()).unbind();

    return this;
  };

  // Display a selection.
  tool.showNTs = function(ntIDs) {
    tool.setup.call(tool);

    if (!ntIDs) {
      return false;
    }

    if (ntIDs.length > tool.maxSize()) {
      return tool.overflow();
    }

    $('#' + tool.tmpID()).remove();
    $('body').append("<input type='radio' id='" + tool.tmpID() +
                     "' data-coord='" + ntIDs.join(',') + "'>");
    $('#' + tool.tmpID()).hide();
    $('#' + tool.tmpID()).jmolTools({
      showNeighborhoodId: tool.neighborhoodID(),
      showNumbersId: tool.numbersID(),
      showStereoId: tool.stereoID()
    }).jmolToggle();

    return tool;
  };

  tool.attach(plot);

  return tool;
};

Rna2D.components.motifs = function(plot) {

  var Motifs = inhert(Rna2D.Component, 'motifs', {
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
    normalize: Object,
    plotIfIncomplete: true,
    visible: function(d, i) { return true; }
  });

  var motifs = new Motifs();

  motifs.boundingBoxes = function(given) {
    return $.map(given, function(current, i) {
      var left = Number.MIN_VALUE,
          right = Number.MAX_VALUE,
          top = Number.MAX_VALUE,
          bottom = Number.MIN_VALUE;

      current.missing = [];

      // Find the outer points.
      var nts = plot.motifs.ntElements()(current);
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
      if (bottom === Number.MIN_VALUE || left === Number.MIN_VALUE || 
          right === Number.MAX_VALUE || top === Number.MAX_VALUE) {
        console.log("Unlikely bounding box found for " + current.id);
        return null;
      }

      if (current.missing && !motifs.plotIfIncomplete()) {
        return null;
      }

      current.bounding = [
        { x: left, y: top },
        { x: left, y: bottom },
        { x: right, y: bottom },
        { x: right, y: top }
      ];

      return current;
    });
  };

  Rna2D.withIdElement.call(motifs);
  Rna2D.withNTElements.call(motifs, plot);
  Rna2D.asToggable.call(motifs, plot);
  Rna2D.asColorable.call(motifs);

  motifs.attach(plot);

  return motifs;
};
Rna2D.components.Nucleotides = function(plot) {

  var NTs = inhert(Rna2D.Component, 'nucleotides', {
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
    getNumber: function(d) { return d.id.split('|')[4]; },
    highlight: Object,
    normalize: Object,
    toggleLetters: Object,
    highlightText: function(d, i) {
      return plot.nucleotides.getSequence()(d, i) +
        plot.nucleotides.getNumber()(d, i);
    },
    visible: function(d, i) { return true; }
  });

  var nts = new NTs();

  nts.count = function() {
    var count = 0,
        getNTData = plot.chains.getNTData();
    $.each(plot.chains(), function(_, chain) {
      count += getNTData(chain).length;
    });
    return count;
  };

  // We do not mix this into the prototype becasue if we do so then the methods
  // will not be accessible outside of the prototype. We do not have access the
  // the methods provided by the prototype outside of this function, this is a
  // problem
  Rna2D.withIdElement.call(nts);
  Rna2D.asToggable.call(nts, plot);
  Rna2D.withInteractions.call(nts, plot);
  Rna2D.asColorable.call(nts);

  nts.attach(plot);

  return nts;
};

Rna2D.components.zoom = function(plot) {

  var Zoom = inhert(Rna2D.Component, 'zoom', {
    scaleExtent: [1, 10],
    currentScale: 1,
    onChange: Object
  });

  Zoom.prototype.draw = function() {

    var self = this,
        translation = 0,
        zoom = d3.behavior.zoom()
          .x(plot.xScale())
          .y(plot.yScale())
          .scaleExtent(this.scaleExtent());

      zoom.on("zoom", function() {
          var scale = d3.event.scale,
              translate = d3.event.translate;

          self.currentScale(scale);
          self.onChange()();

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

      plot.zoom(zoom);
      plot.vis.call(zoom);
  };

  var zoom = new Zoom();
  zoom.attach(plot);

  return zoom;
};

Rna2D.views.airport = function(plot) {

  var Airport = inhert(Rna2D.View, 'airport', { 
    fontSize: 11, 
    gap: 1, 
    highlightSize: 20
  });

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

  Airport.prototype.preprocess = function() {
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

    this.domain = { x: [0, xMax], y: [0, yMax] };
  };
  

  Airport.prototype.xCoord = function() {
    var scale = plot.xScale(),
        getX = plot.nucleotides.getX();
    return function(d, i) { return scale(getX(d, i)); };
  };

  Airport.prototype.yCoord = function() {
    var scale = plot.yScale(),
        getY = plot.nucleotides.getY();
    return function(d, i) { return scale(getY(d, i)); };
  };

  // Draw the nucleotides
  Airport.prototype.coordinates = function() {

    plot.vis.selectAll(plot.chains['class']())
      .append('g')
      .data(plot.chains()).enter()
        .append('g')
        .attr('id', plot.chains.getID())
        .attr('class', plot.chains['class']())
        .selectAll(plot.nucleotides['class']())
        .data(plot.chains.getNTData()).enter()
          .append('svg:text')
          .call(this.standardCoordinates())
          .attr('x', this.xCoord())
          .attr('y', this.yCoord())
          .attr('font-size', this.fontSize())
          .text(plot.nucleotides.getSequence())
          .attr('fill', plot.nucleotides.color());
  };

  Airport.prototype.connections = function() {

    // Compute the data to use for interactions
    var interactions = plot.interactions.valid()(),
        getNTs = plot.interactions.ntElements(),
        gap = this.gap();

    interactions = $.map(interactions, function(obj, i) {
      try {
        var nts = getNTs(obj),
            nt1 = Rna2D.utils.element(nts[0]),
            nt2 = Rna2D.utils.element(nts[1]),
            p1 = intersectPoint(nt1, nt2, gap),
            p2 = intersectPoint(nt2, nt1, gap);
        obj._line = { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y };
      } catch (err) {
        console.log("Could not compute interaction line for", obj);
        console.log(err);
        return null;
      }

      return obj;
    });

    // Draw the interactions
    plot.vis.selectAll(plot.interactions['class']())
      .data(interactions)
      .enter()
        .append('svg:line')
        .call(this.standardConnections())
        .attr('stroke', plot.interactions.color())
        .attr('x1', function(d) { return d._line.x1; })
        .attr('y1', function(d) { return d._line.y1; })
        .attr('x2', function(d) { return d._line.x2; })
        .attr('y2', function(d) { return d._line.y2; });
  };

  Airport.prototype.groups = function() {
      // Compute a box around the motif
      var motifs = plot.motifs.boundingBoxes(plot.motifs());

      if (!motifs || !motifs.length) {
        return plot;
      }

      var motifLine = d3.svg.line()
        .x(function(d) { return d.x; })
        .y(function(d) { return d.y; });

      // Draw the motif boxes
      plot.vis.selectAll(plot.motifs['class']())
        .data(plot.motifs()).enter().append('svg:path')
        .call(this.standardGroups())
        .attr('missing-nts', function(d) { return d.missing.join(' '); })
        .attr('d', function(d) { return motifLine(d.bounding) + "Z"; });

     return plot;
  };

  Airport.prototype.update = function() {

    var self = this;

    plot.interactions.highlight(function(d, i) {
      var highlightColor = plot.interactions.highlightColor()(d, i);
      d3.select(this).style('stroke', highlightColor);
      return plot.interactions.nucleotides(d, i).style('stroke', highlightColor);
    });

    // TODO: To speed up removal of highlight consider using a highlight class
    // and then removing it from all nts.

    plot.interactions.normalize(function(d, i) {
      d3.select(this).style('stroke', null);
      return plot.interactions.nucleotides(d, i).style('stroke', null);
    });

    plot.nucleotides.highlight(function(d, i) {
      var highlightColor = plot.nucleotides.highlightColor()(d, i);
      d3.select(this).style('stroke', highlightColor)
        .attr('fill', highlightColor)
        .attr('font-size', self.highlightSize())
        .text(plot.nucleotides.highlightText());
      return plot.nucleotides.interactions(d, i)
        .style('stroke', highlightColor);
    });

    plot.nucleotides.normalize(function(d, i) {
      d3.select(this).style('stroke', null)
        .attr('fill', null)
        .attr('font-size', self.fontSize())
        .text(plot.nucleotides.getSequence());
      return plot.nucleotides.interactions(d, i)
        .style('stroke', null);
    });

    plot.motifs.highlight(function(d, i) {
      var highlightColor = plot.motifs.highlightColor();
      return plot.motifs.nucleotides(d, i)
        .style('stroke', highlightColor(d, i));
    });

    plot.motifs.normalize(function(d, i) {
      return plot.motifs.nucleotides(d, i)
        .style('stroke', null);
    });
  };

  var air = new Airport();
  air.attach(plot);
  return air;
};

Rna2D.views.circular = function(plot) {

  // We use the total count in a couple places.
  var ntCount;

  // This is used to track some index values and the like
  var computed = {};

  // Used to compute the centroid of a nucleotide on the backbone.
  var ntCentroid;

  // Used to compute the positions of labels
  var labelArcs;

  // Function to generate arcs for both the nucleotides and finding centriods
  // for interactions
  var arcGenerator;

  // The center of where the arc
  var CENTER;

  var Circular = inhert(Rna2D.View, 'circular', {
    radius: function() { return plot.width() / 4; },
    width: 4,
    arcGap: 0.2,
    interactionGap: 3,
    letterClass: 'nucleotide-letter',
    center: function() {
      return { x: plot.width() / 2, y: plot.height() / 2 };
    },
    letterSize: 20,
    chainBreakSize: 0.1,
    labelGap: 3,
    labelSize: 10
  });

  var globalIndex = 0;
  Circular.prototype.preprocess = function() {
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

  Circular.prototype.xCoord = function() {
    return function(d, i) { return CENTER.x + ntCentroid(d, i)[0]; };
  };

  Circular.prototype.yCoord = function() {
    return function(d, i) { return CENTER.y + ntCentroid(d, i)[1]; };
  };

  // Function to draw the arcs.
  Circular.prototype.coordinates = function() {

    ntCount = plot.nucleotides.count();

    CENTER = this.center()();

    var idOf = plot.nucleotides.getID(),
        radius = this.radius()(),
        outerArcs = arcGenerator(radius - this.width(), radius),
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
      .attr('transform', 'translate(' + CENTER.x + ',' + CENTER.y + ')')
      .selectAll(plot.nucleotides['class']())
      .data(plot.chains.getNTData()).enter()
      .append('svg:path')
      .attr('d', function(d, i) {
        return arcFor(d, i)(d, i);
      })
      .attr('fill', plot.nucleotides.color())
      .call(this.standardCoordinates());

    return plot;
  };

  // Function to draw all connections.
  Circular.prototype.connections = function() {

    var self = this;

    // Arc generator for finding the centroid of the nucleotides on the inner
    // circle, which has the interaction endpoints.
    var outerArcInnerRadius = this.radius()() - this.width(),
        innerArcInnerRadius = outerArcInnerRadius - this.interactionGap(),
        innerArcs = arcGenerator(innerArcInnerRadius, outerArcInnerRadius),
        arcFor = function(id) { return innerArcs[computed[id].chainIndex]; },
        startAngleOf = function(id) { return arcFor(id).startAngle()(null, computed[id].ntIndex); },
        centroidOf = function(id) { return arcFor(id).centroid(null, computed[id].ntIndex); };

    // Figure out the centroid position of the nucleotide with the given id in
    // the innerArc.
    var centriodPosition = function(ntID) {
      var centroid = centroidOf(ntID);
      return { x: CENTER.x + centroid[0], y: CENTER.y + centroid[1] };
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
      .call(this.standardConnections())
      .attr('d', curve)
      .attr('fill', 'none')
      .attr('stroke', plot.interactions.color());
  };

  Circular.prototype.groups = function() {
    return this;
  };

  Circular.prototype.labels = function() {
    var innerLabelRadius = this.radius()() + this.labelGap();

    labelArcs = arcGenerator(innerLabelRadius,
                             innerLabelRadius + this.labelSize());

    //plot.vis.selectAll(plot.labels['class']())
      //.append('g')
      //.data(plot.chains()).enter()
        //.append('g')
        //.attr('id', plot.chains.getID())
        //.attr('class', plot.chains['class']())
        //.attr('transform', 'translate(' + center.x + ',' + center.y + ')')
        //.selectAll(plot.nucleotides['class']())
        //.data(plot.chains.getNTData()).enter()
          //.append('svg:path')
          //.attr('d', function(d, i) {
            //return arcFor(d, i)(d, i);
          //})
          //.attr('fill', plot.nucleotides.color())
          //.call(this.standardLabels);
  };

  Circular.prototype.update = function() {
    var self = this;
    plot.nucleotides.highlight(function(d, i) {
      var highlightColor = plot.nucleotides.highlightColor()(d, i);

      d3.select(this)
        .style('stroke', highlightColor)
        .style('fill', highlightColor);

      self.addLetter([d]);

      plot.nucleotides.interactions(d, i)
        .style('stroke', highlightColor);

      return plot.nucleotides;
    });

    plot.nucleotides.normalize(function(d, i) {
      d3.select(this)
        .style('stroke', null)
        .style('fill', null);

      self.clearLetters();

      plot.nucleotides.interactions(d, i)
        .style('stroke', null);

      return plot.nucleotides;
    });

    plot.interactions.highlight(function(d, i) {
      var highlightColor = plot.interactions.highlightColor()(d, i),
          nts = plot.interactions.nucleotides(d, i),
          ntData = [];

      d3.select(this).style('stroke', highlightColor);

      nts.style('stroke', highlightColor)
        .style('fill', highlightColor)
        .datum(function(d, i) {
          ntData.push(d);
          return d;
        });

      self.addLetter(ntData);

      return plot.interactions;
    });

    plot.interactions.normalize(function(d, i) {
      d3.select(this).style('stroke', null);
      self.clearLetters();
      plot.interactions.nucleotides(d, i)
        .style('stroke', null)
        .style('fill', null);
      return plot.interactions;
    });
  };

  Circular.prototype.addLetter = function(ntData) {
    var innerLabelRadius = this.radius()() + this.labelGap();
    labelArcs = arcGenerator(innerLabelRadius,
                             innerLabelRadius + this.labelSize());

    var labelCentroidFor = function(data) {
      var info = computed[plot.nucleotides.getID()(data)];
      return labelArcs[info.chainIndex].centroid(data, info.ntIndex);
    },
    positionOf = function(data) {
      var centriodPosition = labelCentroidFor(data);
      return {
        x: CENTER.x + centriodPosition[0],
        y: CENTER.y + centriodPosition[1]
      };
    };

    plot.vis.selectAll(this.letterClass())
      .data(ntData).enter().append('svg:text')
      .attr('id', function(d, i) { return 'letter-' + i; })
      .attr('class', this.letterClass())
      .attr('x', function(d) { return positionOf(d).x; })
      .attr('y', function(d) { return positionOf(d).y; })
      .attr('font-size', this.letterSize())
      .attr('pointer-events', 'none')
      .text(plot.nucleotides.highlightText())
      .attr('fill', plot.nucleotides.highlightColor());

    return this;
  };

  Circular.prototype.clearLetters = function() {
    plot.vis.selectAll('.' + this.letterClass()).remove();
    return this;
  };

  var view = new Circular();
  view.domain = { x: [0, plot.width()], y: [0, plot.height()] };

  arcGenerator = function(inner, outer) {
    var chainCount = plot.chains().length,
        angleSize = (2*Math.PI - view.arcGap() -
                    (chainCount - 1) * view.chainBreakSize()) / ntCount,
        offset = view.arcGap() / 2,
        getNTData = plot.chains.getNTData();

    return $.map(plot.chains(), function(chain, chainIndex) {
      var startAngle = (function(shift) {
            return function(_, i) { return i * angleSize + shift; };
          }(offset)),
          endAngle = (function(shift) {
            return function(_, i) { return (i + 1) * angleSize + shift; };
          }(offset));

      offset += (chainIndex + 1) * view.chainBreakSize() +
        angleSize * getNTData(chain).length;

      return d3.svg.arc()
        .innerRadius(inner)
        .outerRadius(outer)
        .startAngle(startAngle)
        .endAngle(endAngle);
    });
  };

  view.attach(plot);

  return view;
};


}());
