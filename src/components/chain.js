Rna2D.components.chains = function(plot) {

  var Chains = inhert(Rna2D.Component, 'chains', {
    getID: function(d, i) { return d.id; },
    'class': 'chain',
    classOf: function(d, i) { return []; },
    encodeID: function(id) { return id; },
    getNTData: function(d, i) { return d.nts; },
    visible: function(d, i) { return true; },
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
  Rna2D.withIdElement.call(chain);
  Rna2D.asToggable.call(chain, plot);
  Rna2D.asColorable.call(chain);
  Rna2D.withAttrs.call(chain);
  chain.attach(plot);

  return chain;
};

