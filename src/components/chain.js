Rna2D.components.chains = (function () {
  return {
    dataStore: true,
    config: {
      getID: function(d, i) { return d.id; },
      'class': 'chain',
      classOf: function(d, i) { return []; },
      getNTs: function(d, i) { return d.nts; }
    }
  };
}());

