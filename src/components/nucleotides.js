Rna2D.components.nucleotides = (function() {

  var grouped = [];

  return {

    togglable: true,
    config: function(plot) {
      return {
        highlightColor: function() { return 'red'; },
        'class': 'nucleotide',
        classOf: function(d, i) { return [d.sequence]; },
        color: 'black',
        click: Object,
        mouseover: null,
        mouseout: null,
        getID: function(d) { return d.id; },
        getX: function(d) { return d.x; },
        getY: function(d) { return d.y; },
        encodeID: function(id) { return id; },
        getSequence: function(d) { return d.sequence; },
        highlight: Object,
        normalize: Object,
        toggleLetters: Object,
        getNumber: function(d) { return d.id.split('|')[4]; },
        getChain: function(d) { return d.id.split('|')[2]; }
      };
    },

    sideffects: function(plot) {

      plot.nucleotides.count = function() {
        var count = 0,
            getNTData = plot.chains.getNTData();
        $.each(plot.chains(), function(_, chain) {
          count += getNTData(chain).length;
        });
        return count;
      };
    },

    actions: function(plot) {
      plot.nucleotides.visible('A', 'C', 'G', 'U');

      plot.nucleotides.interactions = function(data, i) {
        var id = plot.nucleotides.getID()(data, i),
            getNTs = plot.interactions.getNTs();
        return plot.vis.selectAll('.' + plot.interactions['class']())
          .filter(function(d, _) { return $.inArray(id, getNTs(d)) !== -1; });
      };

      plot.nucleotides.doColor = function() {
        return plot.nucleotides.all().attr('fill', plot.nucleotides.color());
      };
    }
  };

}());

