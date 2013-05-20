Rna2D.components.chains = (function () {

  return {
    dataStore: true,
    config: function() {
      return {
        getID: function(d, i) { return d.id; },
        'class': 'chain',
        classOf: function(d, i) { return []; },
        getNTData: function(d, i) { return d.nts; },
      };
    },

    sideffects: function(plot) { 
      plot.chains.chainOf = function(d, i) {
        var ntsOf = plot.chains.getNTData(),
            chainIndex = -1;
        $.each(plot.chains(), function(index, chain) {
          if (ntsOf(chain)[i] === d) {
            chainIndex = index;
          }
        });
        return chainIndex;
      };
    },

    actions: function() {}

  };

}());

