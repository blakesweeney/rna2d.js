$(document).ready(function() {

  var generateJmol = function($jmol) {
    var form = '<form class="form-inline">' +
      '<button id="neighborhood" type="button" class="btn">Show neighborhood</button>' +
      '<button id="stereo" type="button" class="btn">Stereo</button>' +
      '<label class="checkbox"><input type="checkbox" id="showNtNums"> Numbers</label>' +
      '</form>';
    $jmol.append(form);
  };

  var highlightInteraction = function() {
    var nts = plot.interactions.nucleotides(this);
    var family = plot.interactions.family(this);
    nts.classed(family, true);
    nts.style('font-size', plot.nucleotides.fontSize() + 4);
    d3.select(this).style('opacity', 1);
  };

  var normalizeInteraction = function() {
    var nts = plot.interactions.nucleotides(this);
    var family = plot.interactions.family(this);
    nts.classed(family, false);
    nts.style('font-size', plot.nucleotides.fontSize());
    d3.select(this).style('opacity', 0.4);
  };

  var highlightNucleotide = function() {
    d3.select(this).style('font-size', plot.nucleotides.fontSize() + 4);
    var inters = plot.nucleotides.interactions(this)
    inters.style('opacity', 1);
  };

  var normalizeNucleotide = function() {
    d3.select(this).style('font-size', plot.nucleotides.fontSize());
    var inters = plot.nucleotides.interactions(this)
    inters.style('opacity', 0.4);
  };

  var motifClick = function() {
    var id = this.id
    var link = '<a href="http://rna.bgsu.edu/rna3dhub/loops/view/' + id +
      '">' + id + '</a>';
    $('#about-selection').children().remove();
    $('#about-selection').append(link);
    $('#about-selection').show();
    return plot.jmol.group({ 'data-nts': this.getAttribute('data-nts') });
  };

  var clickInteraction = function() {
    $('#about-selection').hide();
    return plot.jmol.group({ 'data-nts': this.getAttribute('nt1') + ',' + this.getAttribute('nt2') });
  };

  var clickNucleotide = function() {
    $('#about-selection').hide();
    return plot.jmol.group({ 'data-nts': this.id });
  };

  var brushShow = function(selection) {
    $('#about-selection').hide();
    return plot.jmol.selection(selection);
  };

  var normalColor = function() {
    plot.nucleotides.color(function(d, i) { return 'black'; })
    plot.nucleotides.doColor();
  };

  var colorBySequence = function() {
    plot.nucleotides.color(function(d, i) {
      var sequence = d['id'].split('_')[5];
      if (sequence == 'A') {
        return 'red';
      } else if (sequence == 'C') {
        return 'yellow';
      } else if (sequence == 'G') { 
        return 'green';
      };
      return 'blue';
    });
    plot.nucleotides.doColor();
  }

  var plot = Rna2D({ width: 630, height: 795, selection: '#rna-2d' })
    .motifs.visible(function() { return false; })
    .motifs.click(motifClick)
    .brush.enabled(true)
    .brush.initial([[100, 36], [207, 132]])
    .brush.update(brushShow)
    .nucleotides.click(clickNucleotide)
    .nucleotides.mouseover(highlightNucleotide)
    .nucleotides.mouseout(normalizeNucleotide)
    .interactions.click(clickInteraction)
    .interactions.mouseover(highlightInteraction)
    .interactions.mouseout(normalizeInteraction)
    .jmol.overflow(function() { $("#overflow").show() })
    .jmol.windowBuild(generateJmol)

  d3.json('static/data/16S-ecoli.js', function(data) {
    plot.nucleotides(data);

    d3.csv('static/data/16S-ecoli-interactions.csv', function(data) {
      plot.interactions(data);

      d3.json('static/data/2AW7_motifs.json', function(data) {
        plot.motifs(data);

        plot();
        plot.interactions.toggle('ncWW');
      });
    });
  });

  // Coloring controls.
  $('#sequence-control').on('click', colorBySequence);
  $('#normal-color-control').on('click', normalColor);

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
