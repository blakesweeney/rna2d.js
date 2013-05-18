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

      plot.motifs.nucleotides = function(obj) {
        var motifData = d3.select(obj).datum(),
            nts = plot.motifs.ntElements(motifData),
            selector = '#' + nts.join(', #');
        return plot.vis.selectAll(selector);
      };

    }
  };

}());

