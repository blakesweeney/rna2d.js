Rna2D.motifs = function(plot, config) {

  plot.motifs = function(_) {
    if (!arguments.length) return motifs;
    motifs = _;
    return plot;
  };

  // ---------------------------------------------------------------------------
  // Motif configuration options
  // ---------------------------------------------------------------------------
  (function(config) {
    var motifs = config.motifs || {},
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

  })(config);

  // --------------------------------------------------------------------------
  // Common actions for all motifs.
  // --------------------------------------------------------------------------
  plot.motifs.all = function() {
    return plot.vis.selectAll('.' + config.motif.class);
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

}

