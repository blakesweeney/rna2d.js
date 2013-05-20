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
        toggleLetters: Object
      };
    },

    sideffects: function(plot) {

      plot.nucleotides.jmol = function(d, i) {
        var idOf = plot.nucleotides.getID();
        return plot.jmol.showNTs([idOf(d, i)]);
      };

    },

    actions: function(plot) {
      plot.nucleotides.visible('A', 'C', 'G', 'U');

      // TODO: Use d3.selectAll().filter()
      plot.nucleotides.interactions = function(d, i) {
        var id = plot.nucleotides.getID()(d, i),
            selector = '[nt1=' + id + '], [nt2=' + id + ']';
        return plot.vis.selectAll(selector);
      };

      plot.nucleotides.doColor = function() {
        return plot.nucleotides.all().attr('fill', plot.nucleotides.color());
      };
    }
  };

}());

