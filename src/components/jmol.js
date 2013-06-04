Rna2D.components.jmol = {

  config: {
    divID: 'jmol',
    buildScript: function() {
      return '<script>\n' +
        'jmolInitialize("./static/jmol");\n' +
        'jmolSetAppletColor("#ffffff");\n' +
        '</script>';
    },
    file: 'static/jmol/data/2AVY.pdb',
    showOnStartup: true,
    postSetup: Object
  },

  sideffects: function(plot) {
    var showNTGroup = function(ntAccessor) {
      return function(d, i) {
        var numberOf = plot.nucleotides.getNumber(),
            chainOf = plot.nucleotides.getChain(),
            nts = accessor(d, i),
            data = [];

        nts.datum(function(d) { 
          data.push({number: numberOf(d), chainOf: chainOf(d)});
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

    plot.jmol.interactions = showNTGroup(plot.interactions.nucleotides);
    plot.jmol.motifs = showNTGroup(plot.motifs.nucleotides);
  },

  actions: function(plot) {
    var loaded = false;

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
      var command = ["select all;", "hide;"],
          ntSelect = [];

      $.each(ids, function(index, data) {
        ntSelect.push(data.number + ':' + data.chain);
      });

      commands.push('select ' + ntSelect.join(' and ') + ';');
      commands.push('show');

      return plot.jmol.run(command);
    };

    plot.jmol.run = function(commands) {
      plot.jmol.setup();

      if (typeof(commands) === 'string') {
        return jmolScript(commands);
      }

      return jmolScript(commands.join("\n"));
    };
  },

  generate: function(plot) {
    $(plot.jmol.divID()).append(plot.jmol.buildScript()());
    if (plot.jmol.showOnStartup()) {
      plot.jmol.setup();
    }
    return true;
  }

};

