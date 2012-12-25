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
      // TODO: Why does this not build an accessor?
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

