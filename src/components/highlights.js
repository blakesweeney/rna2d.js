Rna2D.components.Highlights = function(plot) {

  var Highlights = inhert(Rna2D.Component, 'highlights', {
    'class': 'highlight',
    classOf: function(d, i) { return [d.sequence]; },
    color: function() { return 'red'; },
    getID: function(d) { return 'letter-' + d.id; },
    encodeID: function(id) { return id; },
    size: 20,
    visibility: 'visible',
    text: function(lettersOnly) {
      if (lettersOnly) {
        return function(d, i) {
          return plot.nucleotides.getSequence()(d, i);
        };
      }
      return function(d, i) {
        return plot.nucleotides.getSequence()(d, i) +
          plot.nucleotides.getNumber()(d, i);
      };
    }
  });

  var highlights = new Highlights();

  Rna2D.withIdElement.call(highlights);
  Rna2D.asColorable.call(highlights);
  Rna2D.withAttrs.call(highlights);

  highlights.attach(plot);

  return highlights;
};

