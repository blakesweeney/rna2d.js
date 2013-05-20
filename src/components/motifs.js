Rna2D.components.motifs = (function () {

  return {

    dataStore: true,
    togglable: true,
    config: function(plot) {
      return {
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
        normalize: Object
      };
    },

    sideffects: function(plot) {
      plot.motifs.jmol = function(d, i) {
        var getNTs = plot.motifs.getNTs();
        return plot.jmol.showNTs(getNTs(d, i));
      };
    },

    actions: function(plot) {

      plot.motifs.visible('IL', 'HL', 'J3');

      plot.motifs.nucleotides = function(data, i) {
        var nts = plot.motifs.getNTs()(data),
            idOf = plot.nucleotides.getID();
        return plot.vis.selectAll('.' + plot.nucleotides['class']())
          .filter(function(d, i) { return $.inArray(idOf(d, i), nts) !== -1; });
      };

    }
  };

}());

