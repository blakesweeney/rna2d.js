Rna2D.components.motifs = function () {

  return {

    config: {
      classOf: function(d) { return d.id.split("_")[0]; },
      'class': 'motif',
      highlightColor: function() { return 'red'; },
      visible: function(d) { return true; },
      click: null,
      mouseover: null,
      mouseout: null,
      getID: function(d) { return d.id; },
      getNTs: function(d) { return d.nts; },
      highlight: Object,
      normalize: Object
    },

    actions: function(plot) {
      plot.motifs.all = function() {
        return plot.vis.selectAll('.' + plot.motifs['class']());
      };

      plot.motifs.nucleotides = function(obj) {
        var nts = obj.getAttribute('data-nts').split(',');
        var selector = '#' + nts.join(', #');
        return plot.vis.selectAll(selector);
      };

      plot.motifs.show = function() { 
        var visible = plot.motifs.visible();
        return plot.motifs.all().datum(function(d, i) {
          d.__visible = visible(d, i);
          return d;
        }).attr('visibility', function(d, i) {
          return (d.__visible ?  'visible' : 'hidden');
        });
      };

      plot.motifs.hide = function() {
        var visible = plot.motifs.visible();
        return plot.motifs.all().datum(function(d, i) {
          d.__visible = visible(d, i);
          return d;
        }).attr('visibility', function(d, i) {
          return (d.__visible ? 'hidden' : 'visible');
        });
      };

      plot.motifs.toggle = function() {
        var visible = plot.motifs.visible();
        plot.motifs.all().datum(function(d, i) {
          d.__visible = !d.__visible;
          return d;
        }).attr('visibility', function(d, i) {
          return (d.__visible ? 'visible' : 'hidden');
        });
      };

    }
  };

}();
