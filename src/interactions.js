Rna2D.interactions = function(plot, config) {

  plot.interactions = function(_) {
    if (!arguments.length) return interactions;
    interactions = _;
    return plot;
  };

  // An interaction is valid if it is in the forward direction, and
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

  (function(config) {

    var getFamily = function(d) { return d['family'] },
        getNTs = function(d) { return [d['nt1'], d['nt2']]; },
        visible = function(d) { return plot.interactions.getFamily()(d) == 'cWW'; },
        mouseover = Object,
        mouseout = Object,
        click = Object,
        klass = 'interaction'
        ;

    plot.interactions.visible = function(_) {
      if (!arguments.length) return visible;
      visible = _;
      return plot;
    };

    plot.interactions.mouseover = function(_) {
      if (!arguments.length) return mouseover;
      mouseover = _;
      return plot;
    };

    plot.interactions.mouseout = function(_) {
      if (!arguments.length) return mouseout;
      mouseout = _;
      return plot;
    };

    plot.interactions.click = function(_) {
      if (!arguments.length) return click;
      click = _;
      return plot;
    }

    plot.interactions.class = function(_) {
      if (!arguments.length) return klass;
      klass = _;
      return plot;
    }

    plot.interactions.getFamily = function(_) {
      if (!arguments.length) return getFamily;
      getFamily = _;
      return plot;
    };

    plot.interactions.getNTs = function(_) {
      if (!arguments.length) return getNTs;
      getNTs = _;
      return plot;
    };

    var isSymmetric = function(d) {
      var family = plot.interactions.getFamily()(d);
      return family[1] == family[2];
    }

    plot.interactions.isSymmetric = function(_) {
      if (!arguments.length) return isSymmetric;
      isSymmetric = _;
      return plot;
    };

    var getID = function(d) {
      var family = plot.interactions.getFamily()(d),
          nts = plot.interactions.getNTs()(d);
      if (plot.interactions.isSymmetric()(d)) {
        nts.sort();
      };
      return nts.join(',') + ',' + family;
    };

    plot.interactions.getID = function(_) {
      if (!arguments.length) return getID;
      getID = _;
      return plot;
    };

    var isForward = function(d) {
      var getFamily = plot.interactions.getFamily(),
          family = getFamily(d);
      if (family.length == 3) {
        family = family.slice(1, 3).toUpperCase();
      } else {
        family = family.slice(2, 4).toUpperCase();
      }
      return family == 'WW' || family == 'WH' || family == 'WS' || 
             family == 'HH' || family == 'HS' || family == 'SS';
    };

    plot.interactions.isForward = function(_) {
      if (!arguments.length) return isForward;
      isForward = _;
      return plot;
    };

    plot.interactions.classOf = getFamily;

    var color = function(d, i) { return 'black'; };

    plot.interactions.color = function(_) {
      if (!arguments.length) return color;
      color = _;
      return plot;
    };

  })(config);

  return Rna2D;
};

