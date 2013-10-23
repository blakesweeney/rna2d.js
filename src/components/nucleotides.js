Rna2D.components.Nucleotides = function(plot) {

  var NTs = inhert(Rna2D.Component, 'nucleotides', {
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
    visible: function(d, i) { return true; }
  });

  var nts = new NTs();

  // We do not mix this into the prototype becasue if we do so then the methods
  // will not be accessible outside of the prototype. We do not have access the
  // the methods provided by the prototype outside of this function, this is a
  // problem
  Rna2D.withIdElement.call(nts);
  Rna2D.asToggable.call(nts, plot);
  Rna2D.withInteractions.call(nts, plot);
  Rna2D.asColorable.call(nts);
  Rna2D.withAttrs.call(nts);

  nts.attach(plot);

  return nts;
};

