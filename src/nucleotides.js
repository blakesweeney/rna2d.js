Rna2D.nucleotides = function(plot, config) {
  var ordered = {};

  plot.nucleotides = function(_) {
    if (!arguments.length) return nucleotides;
    nucleotides = _;
    return plot;
  };

  plot.nucleotides.ordered = function(_) {
    if (!arguments.length) return ordered;
    ordered = _;
    return plot;
  };

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

  // --------------------------------------------------------------------------
  // Nucleotide configuration options.
  // --------------------------------------------------------------------------
  (function(config) {
    var nucleotides = config.nucleotides || [],
        highlight = nucleotides.highlight || 'red',
        klass = nucleotides['class'] || 'nucleotide',
        klassOf = nucleotides['class'] || function(d, i) { return '' },
        color = nucleotides.class || function(d, i) { return 'black'; },
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

    plot.nucleotides.classOf = function(_) {
      if (!arguments.length) return klassOf;
      klassOf = _;
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

  })(config);


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

  plot.nucleotides.doColor = function() {
    return plot.nucleotides.all().attr('fill', plot.nucleotides.color());
  };

}

