Rna2D.components.nucleotides = function(plot) {

  var Nucleotides = Rna2D.setupComponent('nucleotides', {
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
        plot.nucleotides.getNumber(d, i);
    }
  });

  // TODO: Extend with toggable
  // $.extend(Nucleotide.prototype, Toggable.prototype)

  Nucleotides.prototype.interactions = function(data, i) {
    var id = plot.nucleotides.getID()(data, i),
        getNTs = plot.interactions.getNTs();
    return plot.vis.selectAll('.' + plot.interactions['class']())
      .filter(function(d, _) { return $.inArray(id, getNTs(d)) !== -1; });
  };

  Nucleotides.prototype.doColor = function() {
    return plot.nucleotides.all().attr('fill', plot.nucleotides.color());
  };

  Nucleotides.prototype.count = function() {
    var count = 0,
        getNTData = plot.chains.getNTData();
    $.each(plot.chains(), function(_, chain) {
      count += getNTData(chain).length;
    });
    return count;
  };

  var nts = new Nucleotides();
  // nts.visible('A', 'C', 'G', 'U')
  nts.attach(plot);
};
