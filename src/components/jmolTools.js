Rna2D.components.jmolTools = {

  config: function(plot) {
    return {
      divID: 'jmol',
      appID: 'jmolApplet0',
      tmpID: 'tempJmolToolsObj',
      neighborhoodID: 'neighborhood',
      numbersID: 'showNtNums',
      stereoID: 'stero',
      maxSize: 200,
      overflow: Object,
      windowSize: 400,
      windowBuild: function($div) {
        $div.append('<label><input type="checkbox" id="showNtNums">Numbers</label>')
        .append('<input type="button" id="neighborhood" value="Show neighborhood">')
        .append('<input type="button" id="stereo" value="Stereo">');
      }
    };
  },

  sideffects: function(plot) {
    plot.jmolTools.setup = function() {
      var $app = $('#' + plot.jmolTools.appID()),
          $div = $('#' + plot.jmolTools.divID());

      // launch jmol if necessary
      if ($app.length === 0 ) {
        $div.html(jmolApplet(plot.jmolTools.windowSize(), "", 0));
        plot.jmolTools.windowBuild()($div);
        $div.show();
      }

      // reset the state of the system
      jmolScript('zap;');
      $.jmolTools.numModels = 0;
      $.jmolTools.stereo = false;
      $.jmolTools.neighborhood = false;
      $('#' + plot.jmolTools.neighborhoodID()).val('Show neighborhood');
      $.jmolTools.models = {};

      // unbind all events
      $('#' + plot.jmolTools.stereoID()).unbind();
      $('#' + plot.jmolTools.neighborhoodID()).unbind();
      $('#' + plot.jmolTools.numbersID()).unbind();

      return plot.jmolTools;
    };

    // Display a selection.
    plot.jmolTools.showNTs = function(ntIDs) {
      plot.jmolTools.setup();

      if (ntIDs.length > plot.jmolTools.maxSize()) {
        return plot.jmolTools.overflow();
      }

      $('#' + plot.jmolTools.tmpID()).remove();
      $('body').append("<input type='radio' id='" + plot.jmolTools.tmpID() +
                       "' data-coord='" + ntIDs.join(',') + "'>");
      $('#' + plot.jmolTools.tmpID()).hide();
      $('#' + plot.jmolTools.tmpID()).jmolToolsTools({
        showNeighborhoodId: plot.jmolTools.neighborhoodID(),
        showNumbersId: plot.jmolTools.numbersID(),
        showStereoId: plot.jmolTools.stereoID()
      }).jmolToggle();

      return plot.jmolTools;
    };

    plot.jmolTools.nucleotides = function(d, i) {
      var idOf = plot.nucleotides.getID();
      return plot.jmolTools.showNTs([idOf(d, i)]);
    };

    plot.jmolTools.interactions = function(d, i) {
      var getNTs = plot.interactions.getNTs();
      return plot.jmolTools.showNTs(getNTs(d, i));
    };

    plot.jmolTools.motifs = function(d, i) {
      var getNTs = plot.motifs.getNTs();
      return plot.jmolTools.showNTs(getNTs(d, i));
    };

    plot.jmolTools.brush = function(nts) {
      var idOf = plot.nucleotides.getID(),
          ids = $.map(nts, idOf);
      return plot.jmolTools.showNTs(ids);
    };
  }

};

