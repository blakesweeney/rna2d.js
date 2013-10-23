Rna2D.components.interactions = function(plot) {
  var Interactions = inhert(Rna2D.Component, 'interactions', {
    getFamily: function(d) { return d.family; },
    getNTs: function(d) { return [d.nt1, d.nt2]; },
    mouseover: null,
    mouseout: null,
    click: Object,
    'class': 'interaction',
    classOf: function(d) { return [d.family]; },
    highlightColor: function() { return 'red'; },
    highlight: Object,
    normalize: Object,
    isForward: function(d) {
      var getFamily = plot.interactions.getFamily(),
          family = getFamily(d);
      if (family.length === 3) {
        family = family.slice(1, 3).toUpperCase();
      } else {
        family = family.slice(2, 4).toUpperCase();
      }
      return family === 'WW' || family === 'WH' || family === 'WS' ||
             family === 'HH' || family === 'SH' || family === 'SS';
    },
    isSymmetric: function(d, i) {
      var getFamily = plot.interactions.getFamily(),
          family = getFamily(d);
      return family[1] === family[2];
    },
    getID: function(d) {
      var family = plot.interactions.getFamily()(d),
          nts = plot.interactions.getNTs()(d);
      if (plot.interactions.isSymmetric()(d)) {
        nts.sort();
      }
      nts.push(family);
      return nts.join('-');
    },
    encodeID: function(id) { return id; },
    color: 'black',
    validator: function() {
      var getNts = plot.interactions.getNTs(),
          isForward = plot.interactions.isForward(),
          encodeID = plot.nucleotides.encodeID(),
          bboxOf = function (id) {
            return document.getElementById(encodeID(id));
          };

      return function(current, i) {
        var nts = getNts(current);
        return isForward(current) && nts.length &&
              bboxOf(nts[0]) !== null && bboxOf(nts[1]) !== null;
      };
    },
    visible: function(d, i) {
      var getFamily = plot.interactions.getFamily(),
          family = getFamily(d);
      return family === 'cWW' || family === 'ncWW';
    }
  });

  var interactions = new Interactions();

  interactions.defaultHighlight = function(d, i) {
    var highlightColor = plot.interactions.highlightColor()(d, i),
    ntData = [];

    d3.select(this).style('stroke', highlightColor);

    plot.interactions.nucleotides(d, i)
      .datum(function(d, i) { ntData.push(d); return d; });
    plot.currentView().highlightLetters(ntData);

    return plot.interactions;
  };

  interactions.defaultNormalize = function(d, i) {
    d3.select(this).style('stroke', null);
    plot.currentView().clearHighlightLetters();
    return plot.interactions;
  };

  Rna2D.withIdElement.call(interactions);
  Rna2D.withNTElements.call(interactions, plot);
  Rna2D.asToggable.call(interactions, plot);
  Rna2D.asColorable.call(interactions);
  Rna2D.canValidate.call(interactions, plot);
  Rna2D.withAttrs.call(interactions);

  interactions.attach(plot);

  return interactions;
};

