Rna2D.components.motifs = function(plot) {

  var Motifs = Rna2D.setupComponent('motifs', {
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
    normalize: Object
  });

  // TODO: Extend with toggable
  // $.extend(Motifs.prototype, Toggable.prototype)

  Motifs.prototype.nucleotides = function(d) {
    var nts = plot.motifs.getNTs()(d),
        idOf = plot.nucleotides.getID();
    return plot.vis.selectAll('.' + plot.nucleotides['class']())
      .filter(function(d, i) { return $.inArray(idOf(d, i), nts) !== -1; });
  };

  var motifs = new Motifs();
  // motifs.visible('IL', 'HL', 'J3');
  motifs.attach(plot);
};
