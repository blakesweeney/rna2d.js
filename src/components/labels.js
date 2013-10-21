Rna2D.components.Labels = function(plot) {

  var Labels = inhert(Rna2D.Component, 'labels', {
    'class': 'label',
    classOf: function(d, i) { return []; },
    color: 'black',
    click: Object,
    mouseover: null,
    mouseout: null,
    getText: function(d) { return d.text; },
    getID: function(d) { return d.id; },
    getX: function(d) { return d.x; },
    getY: function(d) { return d.y; },
    encodeID: function(id) { return id; },
    visible: function(d, i) { return true; }
  });

  var labels = new Labels();

  Rna2D.withIdElement.call(labels);
  Rna2D.asToggable.call(labels, plot);
  Rna2D.asColorable.call(labels);
  Rna2D.withAttrs.call(labels);

  labels.attach(plot);

  return labels;
};

