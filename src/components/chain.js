Rna2D.components.chains = function(plot) {

  var Chains = Rna2D.setupComponent('chains', {
    getID: function(d, i) { return d.id; },
    'class': 'chain',
    classOf: function(d, i) { return []; },
    getNTData: function(d, i) { return d.nts; },
    chainOf: function(d, i) {
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
    }
  });

  var chain = new Chains();
  chain.attach(plot);

  return chain;
};

