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
            chainIndex = -1,
            compare = function(d, i, chain) { return ntsOf(chain)[i] === d; };

          if (typeof(d) === "string") {
            var idOf = plot.nucleotides.getID();
            compare = function(d, i, chain) {
              return idOf(ntsOf(chain)[i]) === d;
            };
          }

        $.each(plot.chains(), function(index, chain) {
          if (compare(d, i, chain)) {
            chainIndex = index;
          }
        });
        return chainIndex;
      };
    },

    actions: function() {}

  };

}());

