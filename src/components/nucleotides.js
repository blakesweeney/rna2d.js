Rna2D.components.nucleotides = (function() {

  var ordered = {};

  return {

    togglable: true,
    config: function(plot) {
      return {
        highlightColor: function() { return 'red'; },
        'class': 'nucleotide',
        classOf: function(d, i) { return [d.sequence]; },
        color: 'black',
        click: function(d, i) { return plot.jmol.showSelection([d]); },
        mouseover: null,
        mouseout: null,
        getID: function(d) { return d.id; },
        getX: function(d) { return d.x; },
        getY: function(d) { return d.y; },
        getSequence: function(d) { return d.sequence; },
        highlight: Object,
        normalize: Object,
        toggleLetters: Object
      };
    },

    sideffects: function(plot) {
      plot.nucleotides.computeOrder = function() {
        var nts = plot.nucleotides(),
        getID = plot.nucleotides.getID();

        $.each(nts, function(i, nt) {
          ordered[getID(nt)] = i;
        });

        return plot.nucleotides;
      };

      plot.nucleotides.indexOf = function(ntId) {
        if (!ordered.hasOwnProperty(ntId)) {
          return null;
        }
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
      plot.nucleotides.visible('A', 'C', 'G', 'U');

      plot.nucleotides.selector = function() {
        return '.' + plot.nucleotides['class']();
      };

      plot.nucleotides.interactions = function(given) {
        var obj = given || this;
        var selector = '[nt1=' + obj.getAttribute('id') + '], [nt2=' + obj.getAttribute('id') + ']';
        return plot.vis.selectAll(selector);
      };

      plot.nucleotides.doColor = function() {
        return plot.nucleotides.all().attr('fill', plot.nucleotides.color());
      };
    }
  };

}());

