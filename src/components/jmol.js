Rna2D.components.jmol = function(plot, config) {

  plot.jmol = { show: {} };

  var setup = function() {
    var $app = $('#' + plot.jmol.appID()),
        $div = $('#' + plot.jmol.divID());

    // launch jmol if necessary
    if ($app.length == 0 ) {
      $div.html(jmolApplet(plot.jmol.windowSize(), "", 0))
      plot.jmol.windowBuild()($div);
      $div.show();
    };

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
  };

  // Display a selection.
  plot.jmol.selection = function(matched) {
    setup();

    var data = matched;
    if (typeof(matched) == 'object') {
      var ids = $.map(matched, function(value, key) { return key; });
      data = ids.join(',');
    }

    var count = data.split(',').length;
    if (count > plot.jmol.maxSize()) {
      return plot.jmol.overflow();
    }

    $('#' + plot.jmol.tmpID()).remove();
    $('body').append("<input type='radio' id='" + plot.jmol.tmpID() +
                     "' data-coord='" + data + "'>");
    $('#' + plot.jmol.tmpID()).hide();
    $('#' + plot.jmol.tmpID()).jmolTools({
      showNeighborhoodId: plot.jmol.neighborhoodID(),
      showNumbersId: plot.jmol.numbersID(),
      showStereoId: plot.jmol.stereoID(),
    }).jmolToggle();
  };

  // Show the given group. The group should have a data-nts property which is
  // a string of nt ids to show.
  plot.jmol.group = function(group) {
    if (!arguments.length || !group) group = this;
    plot.jmol.selection(group['data-nts']);
  };

  plot.components.jmol = function() {
    return plot;
  };

  // --------------------------------------------------------------------------
  // jmolTools configuration options
  // --------------------------------------------------------------------------
  (function(given) {
    var jmolConfig = given.jmol || {},
        jmolId = jmolConfig.id || 'jmol',
        jmolAppId = jmolConfig.jmolAppId || 'jmolApplet0',
        jmolTmpId = jmolConfig.jmolTmpId || 'tempJmolToolsObj',
        neighborhoodId = jmolConfig.neighborhood || 'neighborhood',
        numbersId = jmolConfig.numbersId || 'showNtNums',
        stereoId = jmolConfig.stereoId || 'stero',
        max = jmolConfig.max || 200,
        overflow = jmolConfig.overflow || Object,
        windowSize = jmolConfig.windowSize || 400,
        windowBuild = jmolConfig.windowBuild || function($div) {
          $div.append('<label><input type="checkbox" id="showNtNums">Numbers</label>')
            .append('<input type="button" id="neighborhood" value="Show neighborhood">')
            .append('<input type="button" id="stereo" value="Stereo">');
        };

    plot.jmol.maxSize = function(_) {
      if (!arguments.length) return max;
      max = _;
      return plot;
    };

    plot.jmol.overflow = function(_) {
      if (!arguments.length) return overflow;
      overflow = _;
      return plot;
    };

    plot.jmol.windowSize = function(_) {
      if (!arguments.length) return windowSize;
      windowSize = _;
      return plot;
    };

    plot.jmol.windowBuild = function(_) {
      if (!arguments.length) return windowBuild;
      windowBuild = _;
      return plot;
    };

    plot.jmol.divID = function(_) {
      if (!arguments.length) return jmolId;
      divID = _;
      return plot;
    };

    plot.jmol.appID = function(_) {
      if (!arguments.length) return jmolAppId;
      jmolAppId = _;
      return plot;
    };

    plot.jmol.tmpID = function(_) {
      if (!arguments.length) return jmolTmpId;
      jmolTmpId = _;
      return plot;
    };

    plot.jmol.neighborhoodID = function(_) {
      if (!arguments.length) return neighborhoodId;
      neighborhoodId = _;
      return plot;
    };

    plot.jmol.numbersID = function(_) {
      if (!arguments.length) return numbersId;
      numbersId = _;
      return plot;
    };

    plot.jmol.stereoID = function(_) {
      if (!arguments.length) return stereoId;
      stereoId = _;
      return plot;
    };

  })(config);

  return Rna2D;
};
