Rna2D.components.jmol = {

  config: {
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
  },

  sideffects: function(plot) {
    plot.jmol.setup = function() {
      var $app = $('#' + plot.jmol.appID()),
          $div = $('#' + plot.jmol.divID());

      // launch jmol if necessary
      if ($app.length === 0 ) {
        $div.html(jmolApplet(plot.jmol.windowSize(), "", 0));
        plot.jmol.windowBuild()($div);
        $div.show();
      }

      // reset the state of the system
      jmolScript('zap;');
      $.jmolTools.numModels = 0;
      $.jmolTools.stereo = false;
      $.jmolTools.neighborhood = false;
      $('#' + plot.jmol.neighborhoodID()).val('Show neighborhood');
      $.jmolTools.models = {};

      // unbind all events
      $('#' + plot.jmol.stereoID()).unbind();
      $('#' + plot.jmol.neighborhoodID()).unbind();
      $('#' + plot.jmol.numbersID()).unbind();

      return plot.jmol;
    };

    // Display a selection.
    plot.jmol.showSelection = function(matched) {
      plot.jmol.setup();

      if (matched.length > plot.jmol.maxSize()) {
        return plot.jmol.overflow();
      }

      var data = $.map(matched, plot.nucleotides.getID());
      data = data.join(',');

      $('#' + plot.jmol.tmpID()).remove();
      $('body').append("<input type='radio' id='" + plot.jmol.tmpID() +
                       "' data-coord='" + data + "'>");
      $('#' + plot.jmol.tmpID()).hide();
      $('#' + plot.jmol.tmpID()).jmolTools({
        showNeighborhoodId: plot.jmol.neighborhoodID(),
        showNumbersId: plot.jmol.numbersID(),
        showStereoId: plot.jmol.stereoID()
      }).jmolToggle();

      return plot.jmol;
    };

  }

};

