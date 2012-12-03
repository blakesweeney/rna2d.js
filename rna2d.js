(function() {

Rna2D = function(config) {
  var plot = function() {

    var selection = d3.select(plot.selection()),
        frame = plot.frame();

    selection.call(function(selection) {

      // Create visualization object
      plot.vis = selection.append('svg')
        .attr('width', plot.width())
        .attr('height', plot.height());

      // Draw a frame around the plot as needed
      if (frame.add) {
        plot.vis.append('svg:rect')
          .classed(frame.class, true)
          .attr('x', 0)
          .attr('y', 0)
          .attr('width', plot.width())
          .attr('height', plot.height() - 1);
      };

      // Render the view.
      plot.render();

      return plot;
    });
  };

  Rna2D.brush(plot);

  // Configure the plot
  Rna2D.config(plot, config);

  return plot;
};

// Stores the views of the structure
Rna2D.views = {};

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
Rna2D.config = function(plot, given) {

  var nucleotides = given.nucleotdies || [],
      interactions = given.interactions || [],
      motifs = given.motifs || [],
      margin = given.margin || { left: 10, right: 10, above: 10, below: 10 },
      view = given.view || 'airport',
      frame = given.frame || { 'class': 'frame', add: true },
      width =  given.width || 500,
      height = given.height || 1000,
      selection = given.selection;

  plot.selection = function(_) {
    if (!arguments.length) return selection;
    selection = _;
    return plot;
  };

  plot.frame = function(_) {
    if (!arguments.length) return frame;
    frame = _;
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
  // Brush configuration options
  // --------------------------------------------------------------------------
  (function() {

    var brush = given.brush || {}
        enabled = ('enabled' in brush ? brush['enabled'] : true),
        initial = ('initial' in brush ? brush['initial'] : []),
        klass = brush['class'] || 'brush',
        update = brush.update || Object
        clear = brush.clear || Object;

    plot.brush.enabled = function(_) {
      if (!arguments.length) return enabled;
      enabled = _;
      return plot;
    }

    plot.brush.initial = function(_) {
      if (!arguments.length) return initial;
      initial = _;
      return plot;
    };

    plot.brush.class = function(_) {
      if (!arguments.length) return klass;
      klass = _;
      return plot;
    }

    plot.brush.update = function(_) {
      if (!arguments.length) return update;
      update = _;
      return plot;
    }

    plot.brush.clear = function(_) {
      if (!arguments.length) return clear;
      clear = _;
      return plot;
    }

  })();

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
      if (!arguments.length) return highlightColor;
      highlightColor = _;
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
      }
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
    }

    plot.motifs.getID = function(_) {
      if (!arguments.length) return getID;
      getID = _;
      return plot;
    }

    plot.motifs.instanceClass = function(_) {
      if (!arguments.length) return instanceKlass;
      instanceKlass = _;
      return plot;
    }

    plot.motifs.visible = function(_) {
      if (!arguments.length) return visible;
      visible = _;
      return plot;
    };

  })();

  plot.view = function(_) {
    if (!arguments.length) return view;
    view = _;
    Rna2D.views[view](plot).
      brush(plot);
    return plot;
  }
  plot.view(view);

  return plot;
};

Rna2D.brush = function(plot) {

  var brush = function() {

    function startBrush() {
      // Check if click within the bounding box of all nts or interactions.
      // Ugh. Such a pain. Maybe do this later.
    };

    // Do nothing for now.
    function updateBrush(p) { };

    function endBrush() {
      var matched = {};
      if (brush.empty()) {
        plot.brush.clear();
      } else {
        var e = brush.extent();
        vis.selectAll('.' + plot.nucleotides.class())
          .attr("checked", function(d) {
            var inside = e[0][0] <= d.x && d.x <= e[1][0]
              && e[0][1] <= d.y && d.y <= e[1][1];
            if (inside) {
              matched[d.id] = d;
            }
          });
        plot.brush.update(matched);
      };
    };

    var brush = d3.svg.brush()
      .on('brushstart', startBrush)
      .on('brush', updateBrush)
      .on('brushend', endBrush)
      .x(plot.__xScale)
      .y(plot.__yScale);

    // TODO: Do this correctly.
    if (plot.brush.initial()) {
      plot.select(plot.brush.initial());
    }

    return plot;
  };

  plot.brush = brush;

  // Draw the brush around the given extent
  plot.brush.select = function(extent) {
    brush.extent([]);
    startBrush();
    brush.extent(extent);
    updateBrush();
    endBrush();
    return plot;
  };

  // Show the brush
  plot.brush.enable = function() {
    vis.append('g')
      .classed(plot.brush.class(), true)
      .call(brush);
    plot.brush.enabled(true);
    return plot;
  };

  // Hide the brush
  plot.brush.disable = function() {
    vis.selectAll('.' + plot.brush.class()).remove();
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
    if (!argument.length) obj = this;
    var selector = '[nt1=' + obj.getAttribute('id') + '], [nt2=' + obj.getAttribute('id') + ']';
    return plot.vis.selectAll(selector);
  };

  plot.nucleotides.highlight = function(obj) {
    d3.select(obj).style('stroke', plot.nucleotides.highlightColor());
    return plot.nucleotides.interactions(obj).style('stroke', plot.nucleotides.highlightColor());
  };

  plot.nucleotides.normalize = function(obj) {
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
          visible = plot.interactions.visible();

      for(var i = 0; i < raw.length; i++) {
        var obj = raw[i],
            nt1 = Rna2D.utils.element(obj.nt1),
            nt2 = Rna2D.utils.element(obj.nt2);

        if (nt1 && nt2) {

          var p1 = intersectPoint(nt1, nt2, plot.nucleotides.gap()),
              p2 = intersectPoint(nt2, nt1, plot.nucleotides.gap());

          interactions.push({
            visibility: visible(obj),
            family: obj.family,
            id: obj.nt1 + ',' + obj.nt2 + ',' + obj.family,
            nt1: obj.nt1,
            nt2: obj.nt2,
            x1: p1.x,
            y1: p1.y,
            x2: p2.x,
            y2: p2.y
          });

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
        .attr('class', function(d) { d.family; })
        .classed(plot.interactions.class(), true)
        .attr('x1', function(d) { return d.x1; })
        .attr('y1', function(d) { return d.y1; })
        .attr('x2', function(d) { return d.x2; })
        .attr('y2', function(d) { return d.y2; })
        .attr('visibility', function(d) { return (d.visibility ? 'visible' : 'hidden'); })
        .attr('data-nts', function(d) { return d.nt1 + ',' + d.nt2; })
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
    return d3.selectAll(selector);
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
    obj = this;
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
            bottom = 0;

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
        .attr('data-nts', function(d) { plot.motifs.getNTs()(d).join(','); })
        .attr('d', function(d) { return motifLine(d.bounding) + "Z" })
        .attr('visibility', function(d) { return (plot.motifs.visible(d) ? 'visible' : 'hidden') })
        .on('click', plot.motifs.click())
        .on('mouseover', plot.motifs.mouseover())
        .on('mouseout', plot.motifs.mouseout());

     return plot;
  };

  plot.motifs.toggle = function() {

  };

  return Rna2D;
}

})();
