$(document).ready(function() {

  var generateJmol = function($jmol) {
    var form = '<form class="form-inline">' +
      '<button id="neighborhood" type="button" class="btn">Show neighborhood</button>' +
      '<button id="stereo" type="button" class="btn">Stereo</button>' +
      '<label class="checkbox"><input type="checkbox" id="showNtNums"> Numbers</label>' +
      '</form>';
    $jmol.append(form);
  };

  var highlightInteraction = function(obj) {
    var nts = plot.interactions.nts(obj);
    var family = plot.interactions.family(obj);
    nts.classed(family, true);
    nts.style('font-size', 14);
    d3.select(obj).style('opacity', 1);
  };

  var normalizeInteraction = function(obj) {
    var nts = plot.interactions.nts(obj);
    var family = plot.interactions.family(obj);
    nts.classed(family, false);
    nts.style('font-size', 8);
    d3.select(obj).style('opacity', 0.4);
  };

  var highlightNucleotide = function(obj) {
    d3.select(obj).style('font-size', 14);
    var inters = plot.nucleotides.interactions(obj)
    inters.style('opacity', 1);
  };

  var normalizeNucleotide = function(obj) {
    d3.select(obj).style('font-size', 8);
    var inters = plot.nucleotides.interactions(obj)
    inters.style('opacity', 0.4);
  };

  var motifClick = function(motif) {
    var id = motif.id
    var link = '<a href="http://rna.bgsu.edu/rna3dhub/loops/view/' + id +
      '">' + id + '</a>';
    $('#about-selection').children().remove();
    $('#about-selection').append(link);
    $('#about-selection').show();
    return jmol.show.group(motif);
  };

  var clickInteraction = function(interaction) {
    $('#about-selection').hide();
    return jmol.show.group(interaction);
  }

  var brushShow = function(selection) {
    $('#about-selection').hide();
    return jmol.show.selection(selection);
  }

  var jmol = jmol2D({
    group: {
      on: {
        overflow: function() { $("#overflow").show() },
      }
    },
    window: {
      build: generateJmol,
    },
  });

  var plot = plot2D({
    width: 630,
    height: 795,
    motif: {
      visible: false,
      on: {
        click: motifClick,
      }
    },
    brush: {
      enabled: true,
      initial: [[100, 36], [207, 132]],
      on: {
        update: brushShow,
      }
    },
    nucleotide: {
      on: {
        mouseover: highlightNucleotide,
        mouseout: normalizeNucleotide,
      }
    },
    interaction: {
      on: {
        click: clickInteraction,
        mouseover: highlightInteraction,
        mouseout: normalizeInteraction,
      }
    }
  });

  d3.json('static/data/16S-ecoli.js', function(data) {
    plot.coordinates(data);

    d3.csv('static/data/16S-ecoli-interactions.csv', function(data) {
      plot.connections(data);

      d3.json('static/data/2AW7_motifs.json', function(data) {
        plot.groups(data);

        d3.select('#rna-2d').call(plot);
        plot.interactions.toggle('ncWW');
      });
    });
  });

  // Callback to execute when toggling the controls
  var buttonToggle = function($btn) {
    var family = $btn.text();

    // Toggle interactions
    plot.interactions.toggle(family);
    plot.interactions.toggle('n' + family);
  };

  var styleToggle = function($btn) {
    var family = $('.' + $btn.text());
    var background = "#FEFEFE";
    var gradient = "#E6E6E6";
    var color = family.css('stroke');

    if ($btn.hasClass('active')) {
      background = family.css('stroke');
      gradient = family.css('fill');
      color = "#FFFFFF";
    }

    $btn.css('color', color);
    $btn.css('background', background);
    $.each(['-webkit-', '-moz-', '-o-', ''], function(i, el) {
      var gradient_str = 'linear-gradient(top, ' + background +
        ', ' + gradient + ')';
      $btn.css('background-image', el + gradient_str);
    });
  };

  $('#cWW-toggle').button('toggle');

  styleToggle($('#cWW-toggle'));
  styleToggle($('#tWW-toggle'));
  styleToggle($('#cWS-toggle'));
  styleToggle($('#tWS-toggle'));
  styleToggle($('#cWH-toggle'));
  styleToggle($('#tWH-toggle'));
  styleToggle($('#cSH-toggle'));
  styleToggle($('#tSH-toggle'));
  styleToggle($('#cSS-toggle'));
  styleToggle($('#tSS-toggle'));
  styleToggle($('#cHH-toggle'));
  styleToggle($('#tHH-toggle'));

  $('.toggle-control').on('click', function(e) {
    var $btn = $(e.target);
    $btn.button('toggle');
    buttonToggle($btn);
    styleToggle($btn);
  });

  $('#mode-toggle').on('click', function(e) {
    var $btn = $(e.target);
    plot.brush.toggle();

    $btn.button('toggle');
    var text = $btn.data('normal-text');
    if ($btn.hasClass('active')) {
      text = $btn.data('loading-text');
    }
    $btn.text(text);
  });

  $('#motif-toggle').on('click', function(e) {
    var $btn = $(e.target);
    $btn.button('toggle');
    plot.motifs.toggle();

    // Switch into select mode if we are activating, otherwise do nothing
    if ($btn.hasClass('active')) {
      if (!$('#mode-toggle').hasClass('active')) {
        $('#mode-toggle').click();
      }
    }
  });
});
