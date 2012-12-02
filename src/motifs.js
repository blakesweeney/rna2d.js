Rna2D.motifs = function(plot) {
  //     plot.motifs = function() {
  //       var all = function() { return vis.selectAll('.' + config.motif.class); };

  //       return {
  //         nts: function(obj) {
  //           var nts = obj.getAttribute('data-nts').split(',');
  //           var selector = '#' + nts.join(', #');
  //           return d3.selectAll(selector);
  //         },

  //         all: all,

  //         each: function(fn) {
  //           fn(all());
  //           return plot;
  //         },

  //         show: function() {
  //           config.motif.visible = true;
  //           return all().attr('visibility', 'visible');
  //         },

  //         hide: function() {
  //           config.motif.visible = false;
  //           return all().attr('visibility', 'hidden');
  //         },

  //         toggle: function() {
  //           if (config.motif.visible) {
  //             return plot.motifs.hide();
  //           };
  //           return plot.motifs.show();
  //         },

  //         highlight: function(obj) {
  //           return plot.motifs.nts(obj).style('stroke', config.motif.highlight);
  //         },

  //         normalize: function(obj) {
  //           return plot.motifs.nts(obj).style('stroke', null);
  //         },
}

