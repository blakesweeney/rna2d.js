Rna2D.components.Helixes = function(plot) {

  var Helixes = inhert(Rna2D.Component, 'helixes', {
    'class': 'helix-label',
    classOf: function(d, i) { return []; },
    color: 'black',
    click: Object,
    mouseover: null,
    mouseout: null,
    getNTs: function(d) { return d.nts; },
    getText: function(d) { return d.text; },
    getID: function(d) { return d.id; },
    getX: function(d) { return d.x; },
    getY: function(d) { return d.y; },
    encodeID: function(id) { return id; },
    visible: function(d, i) { return true; }
  });

  var helixes = new Helixes();

  Rna2D.withIdElement.call(helixes);
  Rna2D.withNTElements.call(helixes, plot);
  Rna2D.asToggable.call(helixes, plot);
  Rna2D.asColorable.call(helixes);
  Rna2D.withAttrs.call(helixes);

  helixes.attach(plot);

  return helixes;
};

