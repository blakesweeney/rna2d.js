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

  plot.view = function(_) {
    if (!arguments.length) return view;
    view = _;
    Rna2D.views[view](plot).
      brush(plot);
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

  })();

  plot.view(view);

  return plot;
};

