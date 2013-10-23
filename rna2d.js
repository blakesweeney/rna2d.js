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

Rna2D.withAttrs = function() {
  var self = this;
  this._attrs = {};
  this.attr = function(key, value) {
    self._attrs[key] = value;
  };

  this.applyAttrs = function(selection) {
    $.each(self._attrs, function(key, value) {
      selection.attr(key, value);
    });
  };
};

Rna2D.canValidate = function(plot) {
  var self = this;

  this.valid = function(fn) {
    var seen = {},
        getID = self.getID(),
        validator = function(o, _) { return o; };

    if (self.hasOwnProperty('validator')) {
      validator = self.validator()();
    }

    return $.map(plot[self._name](), function(value, key) {
      var id = getID(value);
      if (seen[id] || !validator(value, key)) {
        return null;
      }

      var obj = fn(value, key);
      if (obj) {
        seen[id] = true;
      }
      return obj;
    });
  };
}
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

    if (obj.hasOwnProperty('mouseover') && obj.mouseover() === 'highlight') {
      selection
        .on(handlers.pop(), obj.normalize())
        .on(handlers.pop(), obj.highlight());
    }

    $.each(handlers, function(i, handler) {
      if (obj.hasOwnProperty(handler)) {
        selection.on(handler, obj[handler]());
      }
    });

    return selection;
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
    this.generateHandlers();
    this.coordinates();
    this.connections();
    this.groups();
    this.helixes();
    this.update();
  },

  generateHandlers: function() {

    var self = this,
        plot = this.plot;

    //if (plot.nucleotides.highlight() === Object) {
    //}

    if (plot.nucleotides.highlight() === Object) {
      plot.interactions.highlight(function(d, i) {
        var highlightColor = plot.interactions.highlightColor()(d, i),
        ntData = [];

        d3.select(this).style('stroke', highlightColor);

        plot.interactions.nucleotides(d, i)
        .datum(function(d, i) { ntData.push(d); return d; });
        self.highlightLetters(ntData);

        return plot.interactions;
      });
    }

    if (plot.nucleotides.highlight() === Object) {
      plot.interactions.normalize(function(d, i) {
        d3.select(this).style('stroke', null);
        self.clearHighlightLetters();
        return plot.interactions;
      });
    }

    plot.motifs.highlight(function(d, i) {
      var data = [];
      plot.motifs.nucleotides(d, i)
        .datum(function(d, i) { data.push(d); return d; });
      self.highlightLetters(data, true);
    });

    plot.motifs.normalize(function(d, i) {
      self.clearHighlightLetters();
    });

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
        .attr('visibility', type.visibility())
        .call(type.applyAttrs);
    };
  },

  xDomain: function() { return this.domain.x; },

  yDomain: function() { return this.domain.y; },

  xCoord: function() { return false; },
  yCoord: function() { return false; },
  update: function() { return false; },
  preprocess: function() { return false; },

  chainData: function(s) { return s; },
  coordinateData: function(s) { return s; },
  connectionData: function(s) { return s; },
  groupData: function(s) { return s; },
  helixData: function(s) { return s; },

  coordinateValidor: function(o, i) { return o; },
  interactionValidator: function(o, i) { return o; },
  groupsValidator: function(o, i) { return o; },

  coordinates: function() { 
    var plot = this.plot,
        x = this.xCoord(),
        y = this.yCoord();

    var sele = plot.vis.selectAll(plot.chains['class']())
      .append('g')
      .attr('id', 'all-chains')
      .data(plot.chains()).enter()
        .append('g')
        .attr('id', 'all-nts')
        .call(this.chainData)
        .call(this.drawStandard(plot.chains))
        .selectAll(plot.nucleotides['class']())
        .data(plot.chains.getNTData()).enter();

    return this.coordinateData(sele)
      .call(this.drawStandard(plot.nucleotides))
      .datum(function(d, i) {
        d.__x = x(d, i);
        d.__y = y(d, i);
        return d;
      });
  },

  connections: function() { 
    var plot = this.plot,
        sele = plot.vis.selectAll(plot.interactions['class']())
          .data(plot.interactions.valid(this.interactionValidator)).enter();

    return this.connectionData(sele)
      .call(this.drawStandard(plot.interactions));
  },

  groups: function() {
    var plot = this.plot,
        sele = plot.vis.selectAll(plot.motifs['class']())
          .append('g')
          .attr('id', 'all-motifs')
          .data(plot.motifs.valid(this.groupsValidator)).enter();

    this.groupData(sele)
      .attr('missing-nts', function(d) { return d.__missing.join(' '); })
      .call(this.drawStandard(plot.motifs));
  },

  helixes: function() { 
    var plot = this.plot,
        data = plot.helixes() || [];

    plot.vis.selectAll(plot.helixes['class']())
      .append('g')
      .attr('id', 'all-helixes')
      .data(data).enter()
        .append('svg:text')
        .text(plot.helixes.getText())
        .attr('fill', plot.helixes.color())
        .call(this.helixData)
        .call(this.drawStandard(plot.helixes));
  },

  highlightLetters: function(nts, lettersOnly) {
    var plot = this.plot;

    plot.vis.selectAll(plot.highlights['class']())
      .data(nts).enter()
        .append('svg:text')
        .attr('font-size', plot.highlights.size())
        .attr('pointer-events', 'none')
        .text(plot.highlights.text()(lettersOnly))
        .attr('fill', plot.highlights.color())
        .attr('stroke', plot.highlights.color())
        .call(this.highlightLetterData)
        .call(this.drawStandard(plot.highlights));
  },

  clearHighlightLetters: function() {
    this.plot.vis.selectAll('.' + this.plot.highlights['class']()).remove();
    return this;
  }
};

Rna2D.View = View;
View.defaultNucleotideHighlight = function(d, i) {
  var highlightColor = plot.highlights.color()(d, i);
  self.highlightLetters([d]);
  plot.nucleotides.interactions(d, i).style('stroke', highlightColor);
  return plot.nucleotides;
};

View.defaultNucleotideClear = function(d, i) {
  self.clearHighlightLetters();
  plot.nucleotides.interactions(d, i).style('stroke', null);
  return plot.nucleotides;
};

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
    encodeID: function(id) { return id; },
    getNTData: function(d, i) { return d.nts; },
    visible: function(d, i) { return true; },
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
  Rna2D.withIdElement.call(chain);
  Rna2D.asToggable.call(chain, plot);
  Rna2D.asColorable.call(chain);
  Rna2D.withAttrs.call(chain);
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

Rna2D.components.Helixes = function(plot) {

  var Helixes = inhert(Rna2D.Component, 'helixes', {
    'class': 'helix-label',
    classOf: function(d, i) { return []; },
    color: 'black',
    click: Object,
    mouseover: null,
    mouseout: null,
    getNTs: function(d) { return d.nts; },
    getText: function(d) { return d.text; },
    getID: function(d) { return d.id; },
    getX: function(d) { return d.x; },
    getY: function(d) { return d.y; },
    encodeID: function(id) { return id; },
    visible: function(d, i) { return true; }
  });

  var helixes = new Helixes();

  Rna2D.withIdElement.call(helixes);
  Rna2D.withNTElements.call(helixes, plot);
  Rna2D.asToggable.call(helixes, plot);
  Rna2D.asColorable.call(helixes);
  Rna2D.withAttrs.call(helixes);

  helixes.attach(plot);

  return helixes;
};

Rna2D.components.Highlights = function(plot) {

  var Highlights = inhert(Rna2D.Component, 'highlights', {
    'class': 'highlight',
    classOf: function(d, i) { return [d.sequence]; },
    color: function() { return 'red'; },
    getID: function(d) { return 'letter-' + d.id; },
    encodeID: function(id) { return id; },
    size: 20,
    visibility: 'visible',
    text: function(lettersOnly) {
      if (lettersOnly) {
        return function(d, i) {
          return plot.nucleotides.getSequence()(d, i);
        };
      }
      return function(d, i) {
        return plot.nucleotides.getSequence()(d, i) +
          plot.nucleotides.getNumber()(d, i);
      };
    }
  });

  var highlights = new Highlights();

  Rna2D.withIdElement.call(highlights);
  Rna2D.asColorable.call(highlights);
  Rna2D.withAttrs.call(highlights);

  highlights.attach(plot);

  return highlights;
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
    validator: function() {
      var getNts = plot.interactions.getNTs(),
          isForward = plot.interactions.isForward(),
          encodeID = plot.nucleotides.encodeID(),
          bboxOf = function (id) {
            return document.getElementById(encodeID(id));
          };

      return function(current, i) {
        var nts = getNts(current);
        return isForward(current) && nts.length &&
              bboxOf(nts[0]) !== null && bboxOf(nts[1]) !== null;
      };
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
  Rna2D.canValidate.call(interactions, plot);
  Rna2D.withAttrs.call(interactions);

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

  Rna2D.withIdElement.call(motifs);
  Rna2D.withNTElements.call(motifs, plot);
  Rna2D.asToggable.call(motifs, plot);
  Rna2D.asColorable.call(motifs);
  Rna2D.canValidate.call(motifs, plot);
  Rna2D.withAttrs.call(motifs);

  motifs.attach(plot);

  return motifs;
};
Rna2D.components.Nucleotides = function(plot) {

  var NTs = inhert(Rna2D.Component, 'nucleotides', {
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
  Rna2D.withAttrs.call(nts);

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
    gap: 1,
    type: "circle",
    radius: 4
  });

  var intersectPoint = function(obj1, obj2) {
    var centerOf = function(bbox) { return { x: bbox.x + bbox.width/2, y: bbox.y + bbox.height/2 }; },
        z = 2, // TODO: Scale this with font size
        c1 = centerOf(obj1.getBBox()),
        c2 = centerOf(obj2.getBBox()),
        t = { x: c1.x - c2.x, y: c1.y - c2.y },
        d = Math.sqrt(Math.pow(t.x, 2) + Math.pow(t.y, 2));

    return {
      x1: c1.x - z * t.x / d, y1: c1.y - z * t.y / d,
      x2: c2.x + z * t.x / d, y2: c2.y + z * t.y / d
   };
  };

  Airport.prototype.interactionValidator = function(obj, i) {
    var nts = plot.interactions.getNTs()(obj),
        encodeID = plot.nucleotides.encodeID(),
        nt1 = document.getElementById(encodeID(nts[0])),
        nt2 = document.getElementById(encodeID(nts[1]));

    if (!nt1 || !nt2) {
      console.log("Could not compute interaction line for", obj);
      return null;
    }

    obj.__line = intersectPoint(nt1, nt2);
    return obj;
  };

  Airport.prototype.groupsValidator = function(current, i) {
    var left = Number.MIN_VALUE,
        right = Number.MAX_VALUE,
        top = Number.MAX_VALUE,
        bottom = Number.MIN_VALUE;

    current.__missing = [];

    // Find the outer points.
    var nts = plot.motifs.ntElements()(current);
    $.each(nts, function(j, id) {
      var elem = document.getElementById(id);

      if (elem === null) {
        console.log('Missing nt ' + id + ' in motif: ', current);
        current.__missing.push(id);
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
    }

    if (current.missing && !plot.motifs.plotIfIncomplete()) {
      return null;
    }

    current.__bounding = [
      { x: left, y: top },
      { x: left, y: bottom },
      { x: right, y: bottom },
      { x: right, y: top }
    ];

    return current;
  };

  Airport.prototype.preprocess = function() {
    // Compute the max and min of x and y coords for the scales.
    var xMax = 0,
        yMax = 0,
        getX = plot.nucleotides.getX(),
        getY = plot.nucleotides.getY();

    $.each(plot.chains(), function(_, chain) {
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

  Airport.prototype.coordinateData = function(selection) {
    if (this.type() === "letter") {
      return this.drawLetters(selection);
    } 
    if (this.type() === "circle") {
      return this.drawCircles(selection);
    }
    console.log("Unknown type of drawing.");
    return selection;
  };

  Airport.prototype.drawLetters = function(selection) {
    return selection
      .append('svg:text')
      .attr('x', this.xCoord())
      .attr('y', this.yCoord())
      .attr('fill', plot.nucleotides.color())
      .text(plot.nucleotides.getSequence());
  };

  Airport.prototype.drawCircles = function(selection) {
    return selection
      .append('svg:circle')
      .attr('cx', this.xCoord())
      .attr('cy', this.yCoord())
      .attr('fill', plot.nucleotides.color())
      .attr('r', this.radius());
  };
  


  Airport.prototype.connectionData = function(selection) {
    return selection
      .append('svg:line')
      .attr('stroke', plot.interactions.color())
      .attr('x1', function(d) { return d.__line.x1; })
      .attr('y1', function(d) { return d.__line.y1; })
      .attr('x2', function(d) { return d.__line.x2; })
      .attr('y2', function(d) { return d.__line.y2; });
  };
  
  Airport.prototype.groupData = function(selection) {
      var motifLine = d3.svg.line()
        .x(function(d) { return d.x; })
        .y(function(d) { return d.y; });

      return selection
        .append('svg:path')
        .attr('d', function(d) { return motifLine(d.__bounding) + "Z"; });
  };

  // TODO: This is a horrible hack, I need to fix.
  Airport.prototype.highlightLetterData = function(selection) {
    return selection
      .attr('x', function(d, i) { return d.__x; })
      .attr('y', function(d, i) { return d.__y; });
  };

  Airport.prototype.helixData = function(selection) {
      var xScale = plot.xScale(),
          yScale = plot.yScale(),
          getX = plot.helixes.getX(),
          getY = plot.helixes.getY();

      return selection
        .attr('x', function(d, i) { return xScale(getX(d, i)); })
        .attr('y', function(d, i) { return yScale(getY(d, i)); });
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

  // Function to generate arcs for both the nucleotides and finding centriods
  // for interactions
  var arcGenerator;

  var Circular = inhert(Rna2D.View, 'circular', {
    radius: function() { return plot.width() / 2.5; },
    width: 4,
    arcGap: 0.2,
    interactionGap: 3,
    center: function() {
      return { x: plot.width() / 2, y: plot.height() / 2 };
    },
    chainBreakSize: 0.1,
    helixGap: 3,
    highlightGap: 8,
    labelSize: 10
  });

  Circular.prototype.preprocess = function() {
    var globalIndex = 0,
        getNTData = plot.chains.getNTData(),
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

    ntCount = globalIndex;
  };

  Circular.prototype.xCoord = function() {
    var center = this.center()();
    return function(d, i) { return center.x + ntCentroid(d, i)[0]; };
  };

  Circular.prototype.yCoord = function() {
    var center = this.center()();
    return function(d, i) { return center.y + ntCentroid(d, i)[1]; };
  };

  Circular.prototype.chainData = function(selection) {
    var center = view.center()(),
        translate = 'translate(' + center.x + ',' + center.y + ')';
    return selection.attr('transform', translate);
  };

  // Function to draw the arcs.
  Circular.prototype.coordinateData = function(selection) {

    var idOf = plot.nucleotides.getID(),
        radius = this.radius()(),
        outerArcs = arcGenerator(radius - this.width(), radius),
        arcFor = function(d, i) { return outerArcs[computed[idOf(d)].chainIndex]; };

    ntCentroid = function(d, i) {
      return arcFor(d, i).centroid(d, i);
    };

    // Draw the arcs
    return selection
      .append('svg:path')
      .attr('d', function(d, i) { return arcFor(d, i)(d, i); })
      .attr('fill', plot.nucleotides.color());
  };

  Circular.prototype.connectionData = function(selection) {

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
      var center = view.center()(),
          centroid = centroidOf(ntID);
      return { x: center.x + centroid[0], y: center.y + centroid[1] };
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

    return selection
      .append('path')
      .attr('d', curve)
      .attr('fill', 'none')
      .attr('stroke', plot.interactions.color());
  };

  Circular.prototype.groups = function() {
    return this;
  };

  Circular.prototype.helixData = function(selection) {
    var getLabelID = plot.helixes.getID(),
        getNTs = plot.helixes.getNTs(),
        innerLabelRadius = view.radius()() + view.helixGap(),
        labelArcs = arcGenerator(innerLabelRadius, innerLabelRadius + 5),
        arcFor = function(data) {
          var nt = getNTs(data)[0],
              info = computed[nt];
              // TODO: Fix above getting the correct nt and getting the centriod
              // position using nt data

              return {
                'arc': labelArcs[info.chainIndex],
                'nt': nt,
                'index': info.ntIndex
              };
        },
        positionOf = function(data) {
          var arc = arcFor(data, 'centroid'),
              centriodPosition = arc.arc.centroid(arc.nt, arc.index),
              center = view.center()();

          return {
            x: center.x + centriodPosition[0],
            y: center.y + centriodPosition[1]
          };
        };

    return selection
      .attr('transform', function(d, i) {
        var arc = arcFor(d),
            angle = arc.arc.startAngle()(arc.nt, arc.index);
        return 'rotate(' + angle + ')';
      })
      .attr('x', function(d, i) { return positionOf(d, i).x; })
      .attr('y', function(d, i) { return positionOf(d, i).y; });
  };

  Circular.prototype.ticksData = function(selection) {
    //var innerLabelRadius = this.radius()() + this.labelGap();

    //labelArcs = arcGenerator(innerLabelRadius,
                             //innerLabelRadius + this.labelSize());

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

  Circular.prototype.highlightLetterData = function(selection) {
    var innerLabelRadius = view.radius()() + view.highlightGap(),
        labelArcs = arcGenerator(innerLabelRadius,
                                 innerLabelRadius + view.labelSize()),
        positionOf = function(data) {
          var center = view.center()(),
              info = computed[plot.nucleotides.getID()(data)],
              centriodPosition = labelArcs[info.chainIndex].centroid(data, info.ntIndex);
          return {
            x: center.x + centriodPosition[0],
            y: center.y + centriodPosition[1]
          };
        };

    return selection
      .attr('x', function(d) { return positionOf(d).x; })
      .attr('y', function(d) { return positionOf(d).y; });
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
