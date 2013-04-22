Rna2D.components.interactions = (function () {

  return {

    config: function(plot) {
      return {
        getFamily: function(d) { return d.family; },
        getNTs: function(d) { return [d.nt1, d.nt2]; },
        visible: function(d) { 
          var family = plot.interactions.getFamily()(d);
          return family === 'cWW' || family === 'ncWW'; 
        },
        mouseover: null,
        mouseout: null,
        click: function(d) {
          var nts = plot.interactions.nucleotides(this);
          plot.jmol.showSelection(nts.data());
        },
        'class': 'interaction',
        classOf: function(d) { return d.family; },
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
        color: 'black'
      };
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
            seen = {},
            indexOf = plot.nucleotides.indexOf;

        _.each(interactions, function(current) {
          var id = getID(current),
              nts = getNts(current);

          if (isForward(current) && !seen[id] && nts.length &&
              indexOf(nts[0]) !== null && indexOf(nts[1]) !== null) {
            seen[id] = true;
            valid.push(current);
          }
        });

        return valid;
      };
    },

    actions: function(plot) {

      plot.interactions.all = function(family) {
        family = family || plot.interactions['class']();
        return plot.vis.selectAll('.' + family);
      };

      //plot.interactions.family = function(obj) {
        //return plot.interactions.getFamily()(d3.select(obj).datum());
      //};

      plot.interactions.nucleotides = function(obj) {
        obj = obj || this;
        var data = d3.select(obj).datum(),
            nts = plot.interactions.getNTs()(data),
            selector = '#' + nts.join(', #');
        return plot.vis.selectAll(selector);
      };

      plot.interactions.show = function(family) {
        return plot.interactions.all(family).attr('visibility', function(data) {
          data.__visibility = true;
          return 'visible';
        });
      };

      plot.interactions.hide = function(family) {
        return plot.interactions.all(family).attr('visibility', function(data) {
          data.__visibility = false;
          return 'hidden';
        });
      };

      plot.interactions.toggle = function(family) {
        return plot.interactions.all(family).attr('visibility', function(data) {
          if (data.__visibility) {
            data.__visibility = false;
            return 'hidden';
          }
          data.__visibility = true;
          return 'visible';
        });
      };
    }
  };

}());

