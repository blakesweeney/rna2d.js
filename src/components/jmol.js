Rna2D.components.jmol = function(plot) {

  var loaded = false,
      showNTGroup = function(type) {
        return function(d, i) {
          var numberOf = plot.nucleotides.getNumber(),
              chainOf = plot.nucleotides.getChain(),
              nts = type.nucleotides(d, i),
              data = [];

          nts.datum(function(d) {
            data.push({number: numberOf(d), chain: chainOf(d)});
            return d;
          });

          return plot.jmol.showNTs(data);
        };
      };

  var Jmol = inhert(Rna2D.Component, 'jmol', {
    divID: 'jmol',
    file: 'static/jmol/data/2AVY.pdb',
    showOnStartup: true,
    postSetup: Object,
    render: false,
    nucleotides: function(d, i) {
      var numberOf = plot.nucleotides.getNumber(),
          chainOf = plot.nucleotides.getChain();
      return plot.jmol.showNTs([{number: numberOf(d), chain: chainOf(d)}]);
    },
    interactions: showNTGroup(plot.interactions),
    motifs: showNTGroup(plot.motifs),
    brush: function(data) {
      var numberOf = plot.nucleotides.getNumber(),
          chainOf = plot.nucleotides.getChain();
      return plot.jmol.showNTs($.map(data, function(d) {
        return {number: numberOf(d), chain: chainOf(d)};
      }));
    },
  });

  Jmol.prototype.draw = function() {
    return (plot.jmol.showOnStartup() ? this.setup() : true);
  };

  var jmol = new Jmol();

  jmol.setup = function() {
    if (loaded) {
      return true;
    }

    jmolScript("load " + this.file() + ";");
    loaded = true;
    this.postSetup()();
    return true;
  };

  jmol.showNTs = function(ids) {
    var commands = [],
        ntSelect = [];

    $.each(ids, function(index, data) {
      ntSelect.push(data.number + ':' + data.chain);
    });

    ntSelect = ntSelect.join(' or ');
    commands.push('select ' + ntSelect + ';');
    commands.push('show ' + ntSelect + ';');

    return jmol.run(commands);
  };

  jmol.run = function(commands) {
    this.setup();

    if (typeof(commands) !== 'string') {
      commands = commands.join("\n");
    }

    return jmolScript(commands);
  };

  jmol.attach(plot);
  return jmol;

};

