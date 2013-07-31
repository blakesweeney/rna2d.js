Rna2D.components.jmolTools = function(plot) {
  var jmolTools = Rna2D.setupComponent('jmolTools', {
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
    },
    nucleotides: function(d, i) {
      var idOf = plot.nucleotides.getID();
      return plot.jmolTools.showNTs([idOf(d, i)]);
    },
    interactions: function(d, i) {
      var getNTs = plot.interactions.getNTs();
      return plot.jmolTools.showNTs(getNTs(d, i));
    },
    motifs: function(d, i) {
      var getNTs = plot.motifs.getNTs();
      return plot.jmolTools.showNTs(getNTs(d, i));
    },
    brush: function(nts) {
      var idOf = plot.nucleotides.getID(),
          ids = $.map(nts, idOf);
      return plot.jmolTools.showNTs(ids);
    }
  });

  var tool = new jmolTools();

  tool.setup = function() {
    var $app = $('#' + this.appID()),
        $div = $('#' + this.divID());

    // launch jmol if necessary
    if ($app.length === 0 ) {
      $div.html(jmolApplet(this.windowSize(), "", 0));
      this.windowBuild()($div);
      $div.show();
    }

    // reset the state of the system
    jmolScript('zap;');
    $.jmolTools.numModels = 0;
    $.jmolTools.stereo = false;
    $.jmolTools.neighborhood = false;
    $('#' + this.neighborhoodID()).val('Show neighborhood');
    $.jmolTools.models = {};

    // unbind all events
    $('#' + this.stereoID()).unbind();
    $('#' + this.neighborhoodID()).unbind();
    $('#' + this.numbersID()).unbind();

    return this;
  };

  // Display a selection.
  tool.showNTs = function(ntIDs) {
    tool.setup.call(tool);

    if (!ntIDs) {
      return false;
    }

    if (ntIDs.length > tool.maxSize()) {
      return tool.overflow();
    }

    $('#' + tool.tmpID()).remove();
    $('body').append("<input type='radio' id='" + tool.tmpID() +
                     "' data-coord='" + ntIDs.join(',') + "'>");
    $('#' + tool.tmpID()).hide();
    $('#' + tool.tmpID()).jmolTools({
      showNeighborhoodId: tool.neighborhoodID(),
      showNumbersId: tool.numbersID(),
      showStereoId: tool.stereoID()
    }).jmolToggle();

    return tool;
  };

  tool.attach(plot);

  return tool;
};

