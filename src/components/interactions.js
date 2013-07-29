Rna2D.components.interactions = function(plot) {
  var Interactions = Rna2D.setupComponent('interactions', {
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
    color: 'black'
  });

  // TODO: Extend with toggable
  // $.extend(Interactions.prototype, Toggable.prototype)

  Interactions.prototype.nucleotides = function(data, i) {
    var nts = plot.interactions.getNTs()(data),
        idOf = plot.nucleotides.getID();
    return plot.vis.selectAll('.' + plot.nucleotides['class']())
      .filter(function(d, i) { return $.inArray(idOf(d, i), nts) !== -1; });
  };

  // An interaction is valid if it is in the forward direction, it is not a
  // duplicate, and it has nucleotides which have been indexed. Interactions
  // are duplicate if their ID is the same.
  Interactions.prototype.valid = function() {

    var getID = this.getID(),
        getNts = this.getNTs(),
        isForward = this.isForward(),
        valid = [],
        seen = {},
        encodeID = plot.nucleotides.encodeID(),
        bboxOf = function (id) { return document.getElementById(encodeID(id)); };

    $.each(plot.interactions(), function(i, current) {
      var id = getID(current),
          nts = getNts(current);

      if (isForward(current) && !seen[id] && nts.length &&
          bboxOf(nts[0]) !== null && bboxOf(nts[1]) !== null) {
        seen[id] = true;
        valid.push(current);
      }
    });

    return valid;
  };

  var interactions = new Interactions();
  // interactions.visible('cWW', 'ncWW');
  interactions.attach(plot);

};

