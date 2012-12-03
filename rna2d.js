(function() {

Rna2D = function(config) {
  var plot = function() {

    var selection = d3.select(plot.selection());

    selection.call(function(selection) {

      // Create visualization object
      plot.vis = selection.append('svg')
        .attr('width', plot.width())
        .attr('height', plot.height());

      // Render the view.
      plot.render();

      // Generate the components
      plot.components()

      return plot;
    });
  };

  // Configure the plot
  Rna2D.config(plot, config);

  // Add and configure all components.
  Rna2D.components(plot, config);

  return plot;
};

// Stores the views of the structure
Rna2D.views = {};

Rna2D.components = function(plot, config) {

  plot.components = function() {
    for(var name in plot.components) {
      plot.components[name](plot);
    };
  };

  for(var name in Rna2D.components) {
    Rna2D.components[name](plot, config);
  };

  return Rna2D;
}
Rna2D.config = function(plot, given) {

  var nucleotides = given.nucleotdies || [],
      interactions = given.interactions || [],
      motifs = given.motifs || [],
      margin = given.margin || { left: 10, right: 10, above: 10, below: 10 },
      view = given.view || 'airport',
      width =  given.width || 500,
      height = given.height || 1000,
      selection = given.selection;

  plot.selection = function(_) {
    if (!arguments.length) return selection;
    selection = _;
    return plot;
  };

  plot.view = function(_) {
    if (!arguments.length) return view;
    view = _;
    Rna2D.views[view](plot);
    return plot;
  };

  plot.margin = function(_) {
    if (!arguments.length) return margin;
    margin = _;
    return plot;
  };

  plot.nucleotides = function(_) {
    if (!arguments.length) return nucleotides;
    nucleotides = _;
    return plot;
  };

  plot.interactions = function(_) {
    if (!arguments.length) return interactions;
    interactions = _;
    return plot;
  };

  plot.motifs = function(_) {
    if (!arguments.length) return motifs;
    motifs = _;
    return plot;
  };

  plot.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    return plot;
  };

  plot.height = function(_) {
    if (!arguments.length) return height;
    height = _;
    return plot;
  };

  // --------------------------------------------------------------------------
  // Nucleotide configuration options.
  // --------------------------------------------------------------------------
  (function() {
    var highlight = nucleotides.highlight || 'red',
        klass = nucleotides['class'] || 'nucleotide',
        color = nucleotides.class || Object,
        fontSize = 11,
        gap = 1,
        click = nucleotides.click || Object,
        mouseover = nucleotides.mouseover || Object,
        mouseout = nucleotides.mouseout || Object,
        getID = nucleotides.getID || function(d) { return d['id'] },
        getX = nucleotides.getX || function(d) { return d['x'] },
        getY = nucleotides.getY || function(d) { return d['y'] },
        getSequence = nucleotides.getSequence || function(d) { return d['sequence'] };

    plot.nucleotides.fontSize = function(_) {
      if (!arguments.length) return fontSize;
      fontSize = _;
      return plot;
    };

    plot.nucleotides.class = function(_) {
      if (!arguments.length) return klass;
      klass = _;
      return plot;
    };

    plot.nucleotides.color = function(_) {
      if (!arguments.length) return color;
      color = _;
      return plot;
    };

    plot.nucleotides.highlightColor = function(_) {
      if (!arguments.length) return highlight;
      highlight = _;
      return plot;
    };

    plot.nucleotides.click = function(_) {
      if (!arguments.length) return click;
      click = _;
      return plot;
    };

    plot.nucleotides.mouseover = function(_) {
      if (!arguments.length) return mouseover;
      if (_ === 'highlight') {
        _ = plot.nucleotides.highlight;
        plot.nucleotides.mouseout(plot.nucleotides.normalize);
      }
      mouseover = _;
      return plot;
    };

    plot.nucleotides.mouseout = function(_) {
      if (!arguments.length) return mouseout;
      mouseout = _;
      return plot;
    };

    plot.nucleotides.getID = function(_) {
      if (!arguments.length) return getID;
      getID = _;
      return plot;
    };

    plot.nucleotides.getX = function(_) {
      if (!arguments.length) return getX;
      getX = _;
      return plot;
    };

    plot.nucleotides.getY = function(_) {
      if (!arguments.length) return getY;
      getY = _;
      return plot;
    };

    plot.nucleotides.getSequence = function(_) {
      if (!arguments.length) return getSequence;
      getSequence = _;
      return plot;
    };

    plot.nucleotides.gap = function(_) {
      if (!arguments.length) return gap;
      gap = _;
      return plot;
    };

  })();

  // --------------------------------------------------------------------------
  // Interaction configuration options
  // --------------------------------------------------------------------------
  (function() {

    var klass = interactions['class'] || 'interaction',
      logMissing = true,
      visible = interactions.visible || function(obj) { return obj.family == 'cWW' },
      click = interactions.click || Object,
      mouseover = interactions.mouseover || Object,
      mouseout = interactions.mouseout || Object,
      highlight = interactions.highlight || 'red';

    plot.interactions.class = function(_) {
      if (!arguments.length) return klass;
      klass = _;
      return plot;
    };

    plot.interactions.logMissing = function(_) {
      if (!arguments.length) return logMissing;
      logMissing = _;
      return plot;
    };

    plot.interactions.visible = function(_) {
      if (!arguments.length) return visible;
      visible = _;
      return plot;
    };

    plot.interactions.click = function(_) {
      if (!arguments.length) return click;
      click = _;
      return plot;
    };

    plot.interactions.mouseover = function(_) {
      if (!arguments.length) return mouseover;
      if (_ === 'highlight') {
        _ = plot.interactions.highlight;
        plot.interactions.mouseout(plot.interactions.normalize);
      };
      mouseover = _;
      return plot;
    };

    plot.interactions.mouseout = function(_) {
      if (!arguments.length) return mouseout;
      mouseout = _;
      return plot;
    };

    plot.interactions.highlightColor = function(_) {
      if (!arguments.length) return highlight;
      highlight = _;
      return plot;
    };

  })();

  // --------------------------------------------------------------------------
  // Motif configuration options
  // --------------------------------------------------------------------------
  (function() {
    var motifs = given.motifs || {},
        instanceKlass = motifs['instanceKlass'] || function(d) { return d.id.split("_")[0]; },
        klass = motifs['class'] || 'motif',
        highlight = motifs.highlight || 'red',
        visible = motifs.visible || function(d) { return true; },
        click = motifs.click || Object,
        mouseover = motifs.mouseover || Object
        mouseout = motifs.mouseout || Object,
        getID = motifs.getID || function(d) { return d.id; },
        getNTs = motifs.getNTs || function(d) { return d.nts; };

    plot.motifs.click = function(_) {
      if (!arguments.length) return click;
      click = _;
      return plot;
    };

    plot.motifs.mouseover = function(_) {
      if (!arguments.length) return mouseover;
      if (_ === 'highlight') {
        _ = plot.motifs.highlight;
        plot.motifs.mouseout(plot.motifs.normalize);
      };
      mouseover = _;
      return plot;
    };

    plot.motifs.mouseout = function(_) {
      if (!arguments.length) return mouseout;
      mouseout = _;
      return plot;
    };

    plot.motifs.class = function(_) {
      if (!arguments.length) return klass;
      klass = _;
      return plot;
    };

    plot.motifs.getNTs = function(_) {
      if (!arguments.length) return getNTs;
      getNTs = _;
      return plot;
    };

    plot.motifs.getID = function(_) {
      if (!arguments.length) return getID;
      getID = _;
      return plot;
    };

    plot.motifs.instanceClass = function(_) {
      if (!arguments.length) return instanceKlass;
      instanceKlass = _;
      return plot;
    };

    plot.motifs.visible = function(_) {
      if (!arguments.length) return visible;
      visible = _;
      return plot;
    };

    plot.motifs.highlightColor = function(_) {
      if (!arguments.length) return highlight;
      highlight = _;
      return plot;
    };

  })();

  plot.view(view);

  return plot;
};

Rna2D.motifs = function(plot) {
  //     plot.motifs = function() {
  //       var all = function() { return vis.selectAll('.' + config.motif.class); };

  //       return {
  //         nts: function(obj) {
  //           var nts = obj.getAttribute('data-nts').split(',');
  //           var selector = '#' + nts.join(', #');
  //           return d3.selectAll(selector);
  //         },

  //         all: all,

  //         each: function(fn) {
  //           fn(all());
  //           return plot;
  //         },

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

  //         highlight: function(obj) {
  //           return plot.motifs.nts(obj).style('stroke', config.motif.highlight);
  //         },

  //         normalize: function(obj) {
  //           return plot.motifs.nts(obj).style('stroke', null);
  //         },
}

Rna2D.utils = function() {
  var my = {};

  my.merge = function(update, old) {
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

  my.element = function(id) { 
    return document.getElementById(id); 
  };

  return my;
}();
Rna2D.components.brush = function(plot, config) {

  var brush;

  plot.components.brush = function() {

    brush = d3.svg.brush()
      .on('brushstart', startBrush)
      .on('brush', updateBrush)
      .on('brushend', endBrush)
      .x(plot.__xScale)
      .y(plot.__yScale);

    // Blank for now, later may use this for a multiple selecting brush.
    function startBrush() { };

    // Do nothing for now.
    function updateBrush(p) { };

    function endBrush() {
      var matched = {};

      if (brush.empty()) {
        plot.brush.clear();
      } else {

        var e = brush.extent();
        plot.vis.selectAll('.' + plot.nucleotides.class())
          .attr("checked", function(d) {
            if (e[0][0] <= d.x && d.x <= e[1][0] && 
                e[0][1] <= d.y && d.y <= e[1][1]) {
              matched[d.id] = d;
            }
          });

        plot.brush.update(matched);
      };
    };

    if (plot.brush.initial().length) {
      plot.brush.select(plot.brush.initial());
    }

    if (plot.brush.enabled()) {
      plot.brush.enable();
    };

    return plot;
  };

  plot.brush = function() { return brush; };

  // --------------------------------------------------------------------------
  // Brush configure options
  // --------------------------------------------------------------------------
  (function(given) {
    var brush = given.brush || {},
        enabled = ('enabled' in brush ? brush.enabled : true),
        initial = ('initial' in brush ? brush.initial : []),
        klass = brush['class'] || 'brush',
        update = brush.update || Object,
        clear = brush.clear || Object;

    plot.brush.enabled = function(_) {
      if (!arguments.length) return enabled;
      enabled = _;
      return plot;
    };

    plot.brush.initial = function(_) {
      if (!arguments.length) return initial;
      initial = _;
      return plot;
    };

    plot.brush.class = function(_) {
      if (!arguments.length) return klass;
      klass = _;
      return plot;
    };

    plot.brush.update = function(_) {
      if (!arguments.length) return update;
      update = _;
      return plot;
    };

    plot.brush.clear = function(_) {
      if (!arguments.length) return clear;
      clear = _;
      return plot;
    };

  })(config);

  // Draw the brush around the given extent
  // TODO: Do this correctly.
  plot.brush.select = function(extent) {
    brush.extent(extent);
    brush(plot.selection());
    return plot;
  };

  // Show the brush
  plot.brush.enable = function() {
    plot.vis.append('g')
      .classed(plot.brush.class(), true)
      .call(brush);
    plot.brush.enabled(true);
    return plot;
  };

  // Hide the brush
  plot.brush.disable = function() {
    plot.vis.selectAll('.' + plot.brush.class()).remove();
    plot.brush.enabled(false);
    return plot;
  };

  // Toggle the brush
  plot.brush.toggle = function() {
    if (plot.brush.enabled()) {
      return plot.brush.disable();
    };
    return plot.brush.enable();
  };

  return Rna2D;
};

Rna2D.components.frame = function(plot, config) {

  plot.components.frame = function() {

    // Draw a frame around the plot as needed
    if (plot.frame.add()) {
      plot.vis.append('svg:rect')
        .classed(plot.frame.class(), true)
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', plot.width())
        .attr('height', plot.height() - 1)
        .style('pointer-events', 'none');
    };
  }

  plot.frame = {};

  // Frame configuration options
  (function(given) {
    var frame = given.frame || {},
        add = ('add' in frame ? frame.add : true),
        klass = frame['class'] || 'frame';

    plot.frame.add = function(_) {
      if (!arguments.length) return add;
      add = _;
      return plot;
    };

    plot.frame.class = function(_) {
      if (!arguments.length) return klass;
      klass = _;
      return plot;
    };

  })(config);

  return Rna2D;
}

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
    console.log($div);

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
    console.log(matched);

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

    console.log($('#' + plot.jmol.tmpID()));
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
// Container for the airport view
Rna2D.views.airport = function(plot) {

  // Configure all components of the plot
  Rna2D.views.airport.coordinates(plot)
    .views.airport.connections(plot)
    .views.airport.groups(plot);

  var airport = function() {
    return plot.coordinates()
      .connections()
      .groups();
  };

  plot.render = airport;

  return Rna2D;
};

Rna2D.views.airport.coordinates = function(plot) {

  // We make a chart function which draws the nucleotides in the given
  // coordinates.
  var chart = function() {

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

    plot.__xScale = xScale;
    plot.__yScale = yScale;
    plot.__xCoordMax = xCoordMax;
    plot.__yCoordMax = yCoordMax;

    // Draw all nucleotides.
    plot.vis.selectAll(plot.nucleotides.class())
      .data(data).enter().append('svg:text')
      .attr('id', plot.nucleotides.getID())
      .classed(plot.nucleotides.class(), true)
      .attr('x', function(d, i) { return xScale(plot.nucleotides.getX()(d, i)); })
      .attr('y', function(d, i) { return yScale(plot.nucleotides.getY()(d, i)); })
      .attr('font-size', plot.nucleotides.fontSize())
      .text(plot.nucleotides.getSequence())
      .on('click', plot.nucleotides.click())
      .on('mouseover', plot.nucleotides.mouseover())
      .on('mouseout', plot.nucleotides.mouseout());

    return plot;
  };

  plot.coordinates = chart;

  // --------------------------------------------------------------------------
  // Define the common actions for a nucleotide in a plot.
  // --------------------------------------------------------------------------
  plot.nucleotides.all = function() {
    return plot.vis.selectAll('.' + plot.nucleotide.class());
  };

  plot.nucleotides.interactions = function(obj) {
    if (!arguments.length) obj = this;
    var selector = '[nt1=' + obj.getAttribute('id') + '], [nt2=' + obj.getAttribute('id') + ']';
    return plot.vis.selectAll(selector);
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

  plot.nucleotides.doColor = function() {
    return plot.nucleotides.all().attr('color', plot.nucleotides.color());
  };

  return Rna2D;
};

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

  var chart = function() {

      // Compute the data to use for interactions
      var interactions = [],
          raw = plot.interactions(),
          visible = plot.interactions.visible(),
          seen = {},
          idOf = function(nt1, nt2, family) { return nt1 + ',' + nt2 + ',' + family; };

      for(var i = 0; i < raw.length; i++) {
        var obj = raw[i],
            nt1 = Rna2D.utils.element(obj.nt1),
            nt2 = Rna2D.utils.element(obj.nt2),
            id = idOf(obj.nt1, obj.nt2, obj.family),
            revId = idOf(obj.nt2, obj.nt1, obj.family);

        if (nt1 && nt2) {
          if (!seen[id] && !seen[revId]) {

            var p1 = intersectPoint(nt1, nt2, plot.nucleotides.gap()),
                p2 = intersectPoint(nt2, nt1, plot.nucleotides.gap());

            var family = obj.family;
            if (family[1] == family[2]) {
            // if (plot.interactions.isSymmetric(family)) {
              seen[id] = true;
            };

            interactions.push({
              visibility: visible(obj),
              classes: obj.family + ' ' + plot.interactions.class(),
              'data-nts': obj.nt1 + ',' + obj.nt2,
              id: obj.nt1 + ',' + obj.nt2 + ',' + obj.family,
              nt1: obj.nt1,
              nt2: obj.nt2,
              x1: p1.x,
              y1: p1.y,
              x2: p2.x,
              y2: p2.y
            });
          };

        } else {
          if (plot.interactions.logMissing()) {
            console.log("Could not find both nts in ", obj);
          }
        };
      }

      // Draw the interactions
      plot.vis.selectAll(plot.interactions.class())
        .data(interactions)
        .enter().append('svg:line')
        .attr('id', function(d) { return d.id; })
        .attr('class', function(d) { return d.classes; })
        .attr('x1', function(d) { return d.x1; })
        .attr('y1', function(d) { return d.y1; })
        .attr('x2', function(d) { return d.x2; })
        .attr('y2', function(d) { return d.y2; })
        .attr('visibility', function(d) { return (d.visibility ? 'visible' : 'hidden'); })
        .attr('data-nts', function(d) { return d.data; })
        .attr('nt1', function(d, i) { return d.nt1; })
        .attr('nt2', function(d, i) { return d.nt2; })
        .on('click', plot.interactions.click())
        .on('mouseover', plot.interactions.mouseover())
        .on('mouseout', plot.interactions.mouseout());

    return plot;
  };

  // Set the rendering function
  plot.connections = chart;

  // --------------------------------------------------------------------------
  // The general actions for an interaction
  // --------------------------------------------------------------------------
  plot.interactions.all = function(family) {
    if (!arguments.length || !family) family = plot.interactions.class();
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

Rna2D.views.airport.groups = function(plot) {

  plot.groups = function() {
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
        .attr('id', plot.motifs.getID())
        .attr('class', plot.motifs.instanceClass())
        .classed(plot.motifs.class(), true)
        .attr('data-nts', function(d) { return plot.motifs.getNTs()(d).join(','); })
        .attr('d', function(d) { return motifLine(d.bounding) + "Z" })
        .attr('visibility', function(d) { return (d.visible ? 'visible' : 'hidden'); })
        .on('click', plot.motifs.click())
        .on('mouseover', plot.motifs.mouseover())
        .on('mouseout', plot.motifs.mouseout());

     return plot;
  };

  plot.motifs.all = function(family) {
    if (!arguments.length || !family) family = plot.motifs.class();
    return plot.vis.selectAll('.' + family);
  };

  plot.motifs.nucleotides = function(obj) {
    var nts = obj.getAttribute('data-nts').split(',');
    var selector = '#' + nts.join(', #');
    return d3.selectAll(selector);
  };

  plot.motifs.show = function(family) {
    return plot.motifs.all(family)
      .attr('visibility', function(d) {
        d.visible = true;
        return 'visible';
      });
  };

  plot.motifs.hide = function(family) {
    return plot.motifs.all(family)
      .attr('visibility', function(d) {
        d.visible = false;
        return 'hidden';
      });
  };

  plot.motifs.toggle = function(family) {
    return plot.motifs.all(family)
      .attr('visibility', function(d) {
        d.visible = !d.visible;
        if (d.visible == false) {
          return 'hidden';
        };
        return 'visible';
      });
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
}


})();
