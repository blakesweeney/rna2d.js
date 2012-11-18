var jmol2D = function(given) {

  var merge = function(update, old) {
    for(var key in old) {
      var val = old[key];
      if (typeof(val) == 'object') {
        update[key]  = merge(update[key] || {}, val);
      } else {
        update[key] = val;
      }
    }
    return update;
  };

  var config = {
    group: {
      max: 200,
      on: {
        overflow: Object,
      }
    },
    window: {
      size: 400,
      build: undefined,
    }
  };

  config = merge(config, given);
  var connection = {
    show: {},
  };

  connection.setup = function() {
    var jmolApp = $('#jmolApplet0');
    var jmolDiv = $('#jmol');
    $this = $(this);

    // launch jmol if necessary
    if (jmolApp.length == 0 ) {
      jmolDiv.html( jmolApplet(config.window.size, "", 0) )
      if (config.window.build !== undefined) {
        config.window.build(jmolDiv);
      } else {
        jmolDiv.append('<label><input type="checkbox" id="showNtNums">Numbers</label>') 
          .append('<input type="button" id="neighborhood" value="Show neighborhood">') 
          .append('<input type="button" id="stereo" value="Stereo">');
      }
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
  connection.show.selection = function(matched) {
    connection.setup();

    var data_coord = '';
    if (typeof(matched) == 'object') {
      var ids = $.map(matched, function(value, key) { return key; });
      data_coord = ids.join(',');
    } else {
      data_coord = matched;
    }

    var count = data_coord.split(',').length;
    if (count > config.group.max) {
      config.group.on.overflow();
      return;
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

  // Show the given interaction.
  connection.show.group = function(interaction) {
    connection.show.selection(interaction['data-nts']);
  };

  return connection;
};
