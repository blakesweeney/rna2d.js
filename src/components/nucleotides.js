Rna2D.components.nucleotides = function() {

  var ordered = {};

  return {

    config: {
      highlightColor: 'red',
      'class': 'nucleotide',
      classOf: function(d, i) { return ''; },
      color: 'black',
      fontSize: 11,
      gap: 1,
      click: null,
      mouseover: null,
      mouseout: null,
      getID: function(d) { return d.id; },
      getX: function(d) { return d.x; },
      getY: function(d) { return d.y; },
      getSequence: function(d) { return d.sequence; },
      highlight: Object,
      normalize: Object
    },

    sideffects: function(plot) {
      plot.nucleotides.computeOrder = function() {
        var nts = plot.nucleotides(),
            getID = plot.nucleotides.getID();
        for(var i = 0; i < nts.length; i++) {
          var id = getID(nts[i]);
          ordered[getID(nts[i])] = i;
        }

        return plot.nucleotides;
      };

      plot.nucleotides.indexOf = function(ntId) {
        return ordered[ntId];
      };

      plot.nucleotides.ordered = function(_) {
        if (!arguments.length) {
          return ordered;
        }
        ordered = _;
        return plot.nucleotides;
      };
    },

    actions: function(plot) {
      plot.nucleotides.all = function() {
        return plot.vis.selectAll('.' + plot.nucleotide['class']());
      };

      plot.nucleotides.interactions = function(obj) {
        if (!arguments.length) {
          obj = this;
        }
        var selector = '[nt1=' + obj.getAttribute('id') + '], [nt2=' + obj.getAttribute('id') + ']';
        return plot.vis.selectAll(selector);
      };

      plot.nucleotides.doColor = function() {
        return plot.nucleotides.all().attr('fill', plot.nucleotides.color());
      };
    }
  };

}();

