var jmolSetup = function() {
  var jmolApp = $('#jmolApplet0');
  var jmolDiv = $('#jmol');
  $this = $(this);

  // launch jmol if necessary
  if (jmolApp.length == 0 ) {
    jmolDiv.html( jmolApplet(400, "", 0) )
    .prepend('<label><input type="checkbox" id="showNtNums">Nucleotide numbers</label>')
    .prepend('<input type="button" class="btn" id="neighborhood" value="Show neighborhood">')
    .prepend('<input type="button" id="stereo" value="Stereo">')
    .show();
  }

  // clear jmol window
  jmolScript('zap;');

  // reset the state of the system
  $.jmolTools.numModels = 0;
  $.jmolTools.stereo = false;
  $.jmolTools.neighborhood = false;
  $('#neighborhood').val('Show neighborhood');
  $.jmolTools.models = {};
  // unbind all events
  $('#stereo').unbind();
  $('#neighborhood').unbind();
  $('#showNtNums').unbind();

};

// Code to integrate this with RNA2D with Jmol tools.
var jmolShowSelection = function(matched) {
  jmolSetup();

  var data_coord = '';
  if (typeof(matched) == 'object') {
    var ids = $.map(matched, function(value, key) { return key; });
    data_coord = ids.join(',');
  } else {
    data_coord = matched;
  }

  $('#tempJmolToolsObj').remove();
  $('body').append("<input type='radio' id='tempJmolToolsObj' data-coord='" + data_coord + "'>");
  $('#tempJmolToolsObj').hide();
  $('#tempJmolToolsObj').jmolTools({
    showNeighborhoodId: 'neighborhood',
    showNumbersId: 'showNtNums',
    showStereoId: 'stereo',
  }).jmolToggle();
};

var jmolShowInteraction = function(interaction) {
  var data = {};
  jmolShowSelection(interaction['data-nts']);
};
