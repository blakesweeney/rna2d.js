Rna2D.components.Nucleotides = function(plot) {

  var NTs = inhert(Rna2D.Component, 'nucleotides', {
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
    getNumber: function(d) { return d.id.split('|')[4]; },
    highlight: Object,
    normalize: Object,
    toggleLetters: Object,
    highlightText: function(d, i) {
      return plot.nucleotides.getSequence()(d, i) +
        plot.nucleotides.getNumber()(d, i);
    },
    visible: function(d, i) { return true; }
  });

  var nts = new NTs();

  nts.count = function() {
    var count = 0,
        getNTData = plot.chains.getNTData();
    $.each(plot.chains(), function(_, chain) {
      count += getNTData(chain).length;
    });
    return count;
  };

  // We do not mix this into the prototype becasue if we do so then the methods
  // will not be accessible outside of the prototype. We do not have access the
  // the methods provided by the prototype outside of this function, this is a
  // problem
  Rna2D.withIdElement.call(nts);
  Rna2D.asToggable.call(nts, plot);
  Rna2D.withInteractions.call(nts, plot);
  Rna2D.asColorable.call(nts);

  nts.attach(plot);

  return nts;
};

