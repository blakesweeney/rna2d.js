Rna2D.components.Helixes = function(plot) {

  var Helixes = inhert(Rna2D.Component, 'helixes', {
    'class': 'helix-label',
    classOf: function(d, i) { return []; },
    color: function(d, i) { return d.color || 'black'; },
    click: Object,
    mouseover: Object,
    mouseout: Object,
    getNTs: function(d) { return d.nts; },
    getText: function(d) { return d.text; },
    getID: function(d) { return d.id; },
    getX: function(d) { return d.x; },
    getY: function(d) { return d.y; },
    encodeID: function(id) { return id; },
    visible: function(d, i) { return true; }
  });

  var helixes = new Helixes();

  helixes.colorByHelix = function() {
    var ntColor = plot.nucleotides.color(),
        getNTs = plot.helixes.getNTs(),
        getNTID = plot.nucleotides.getID(),
        helixColor = plot.helixes.color(),
        ntMap = {};

    $.each(plot.helixes(), function(i, helix) {
      $.each(getNTs(helix, i), function(j, nt) {
        ntMap[nt] = [helix, i];
      });
    });

    plot.nucleotides.color(function(d, i) {
      var data = ntMap[getNTID(d, i)];
      return (data ? helixColor.apply(this, data) : 'black');
    });

    plot.helixes.colorize();
    plot.nucleotides.colorize();

    plot.nucleotides.color(ntColor);
  };

  Rna2D.withIdElement.call(helixes);
  Rna2D.withNTElements.call(helixes, plot);
  Rna2D.asToggable.call(helixes, plot);
  Rna2D.asColorable.call(helixes);
  Rna2D.withAttrs.call(helixes);

  helixes.attach(plot);

  return helixes;
};

