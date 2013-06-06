Rna2D.components.jmol = {

  config: function(plot) {
    return {
      enable: false,
      divID: 'jmol',
      file: 'static/jmol/data/2AVY.pdb',
      showOnStartup: true,
      postSetup: Object
    };
  },

  actions: function(plot) {
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

    plot.jmol.nucleotides = function(d, i) {
        var numberOf = plot.nucleotides.getNumber(),
            chainOf = plot.nucleotides.getChain();
        return plot.jmol.showNTs([{number: numberOf(d), chain: chainOf(d)}]);
    };

    plot.jmol.interactions = showNTGroup(plot.interactions);
    plot.jmol.motifs = showNTGroup(plot.motifs);

    plot.jmol.brush = function(data) {
      var numberOf = plot.nucleotides.getNumber(),
          chainOf = plot.nucleotides.getChain();
      return plot.jmol.showNTs($.map(data, function(d) {
        return {number: numberOf(d), chain: chainOf(d)};
      }));
    };

    plot.jmol.setup = function() {
      if (loaded) {
        return true;
      }

      jmolScript("load " + plot.jmol.file() + ";");
      loaded = true;
      plot.jmol.postSetup()();
      return true;
    };

    plot.jmol.showNTs = function(ids) {
      var commands = [],
          ntSelect = [];

      $.each(ids, function(index, data) {
        ntSelect.push(data.number + ':' + data.chain);
      });

      ntSelect = ntSelect.join(' or ');
      commands.push('select ' + ntSelect + ';');
      commands.push('show ' + ntSelect + ';');

      return plot.jmol.run(commands);
    };

    plot.jmol.run = function(commands) {
      plot.jmol.setup();

      if (typeof(commands) !== 'string') {
        commands = commands.join("\n");
      }

      return jmolScript(commands);
    };
  },

  generate: function(plot) {
    if (!plot.jmol.enable()) {
      return false;
    }

    if (plot.jmol.showOnStartup()) {
      plot.jmol.setup();
    }
    return true;
  }

};

