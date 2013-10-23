Rna2D.components.motifs = function(plot) {

  var Motifs = inhert(Rna2D.Component, 'motifs', {
    classOf: function(d) { return [d.id.split("_")[0]]; },
    'class': 'motif',
    highlightColor: function() { return 'red'; },
    click: Object,
    mouseover: null,
    mouseout: null,
    getID: function(d) { return d.id; },
    encodeID: function(id) { return id; },
    getNTs: function(d) { return d.nts; },
    highlight: Object,
    normalize: Object,
    plotIfIncomplete: true,
    visible: function(d, i) { return true; }
  });

  var motifs = new Motifs();

  motifs.defaultHighlight = function(d, i) {
    var data = [];
    plot.motifs.nucleotides(d, i)
      .datum(function(d, i) { data.push(d); return d; });
    plot.currentView().highlightLetters(data, true);
  };

  motifs.defaultNormalize = function(d, i) {
    plot.currentView().clearHighlightLetters();
  };

  Rna2D.withIdElement.call(motifs);
  Rna2D.withNTElements.call(motifs, plot);
  Rna2D.asToggable.call(motifs, plot);
  Rna2D.asColorable.call(motifs);
  Rna2D.canValidate.call(motifs, plot);
  Rna2D.withAttrs.call(motifs);

  motifs.attach(plot);

  return motifs;
};
