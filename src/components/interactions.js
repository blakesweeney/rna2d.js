Rna2D.components.interactions = (function () {

  return {

    dataStore: true,
    togglable: true,
    config: function(plot) {
      return {
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
            encodeID = plot.nucleotides.encodeID(),
            bboxOf = function (id) { return document.getElementById(encodeID(id)); };

        $.each(interactions, function(i, current) {
          var id = getID(current),
              nts = getNts(current);

          if (isForward(current) && !seen[id] && nts.length &&
              bboxOf(nts[0]) !== null && bboxOf(nts[1]) !== null) {
            seen[id] = true;
            valid.push(current);
          }
        });

        return valid;
      };

      plot.interactions.jmol = function(d, i) {
        var getNTs = plot.interactions.getNTs();
        return plot.jmol.showNTs(getNTs(d, i));
      };
    },

    actions: function(plot) {

      plot.interactions.visible('cWW', 'ncWW');

      plot.interactions.nucleotides = function(data, i) {
        var nts = plot.interactions.getNTs()(data),
            idOf = plot.nucleotides.getID();
        return plot.vis.selectAll('.' + plot.nucleotides['class']())
          .filter(function(d, i) { return $.inArray(idOf(d, i), nts) !== -1; });
      };

    }
  };

}());

