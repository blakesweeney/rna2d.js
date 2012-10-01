// Code to integrate this with RNA2D with Jmol tools.
var jmolShow = function(ids) {
  var jmolApp = $('#jmolApplet0');
  var jmolDiv = $('#jmol');
  $this = $(this);

  // launch jmol if necessary
  if (jmolApp.length == 0 ) {
    jmolDiv.html( jmolApplet(300, "", 0) )
    .append('<label><input type="checkbox" id="showNtNums">Nucleotide numbers</label>')
    .append('<input type="button" class="btn" id="neighborhood" value="Show neighborhood">')
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

  var data_coord = ids.join(',');
  $('#tempJmolToolsObj').remove();
  $('body').append("<input type='radio' id='tempJmolToolsObj' data-coord='" + data_coord + "'>");
  $('#tempJmolToolsObj').hide();
  $('#tempJmolToolsObj').jmolTools({
    showNeighborhoodId: 'neighborhood',
    showNumbersId: 'showNtNums',
  }).jmolToggle();
};
