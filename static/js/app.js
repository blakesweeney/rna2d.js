$(document).ready(function() {
  "use strict";
  /*global alert, Rna2D, d3, $ */

  var plot = Rna2D({ view: 'airport', width: 630, height: 795 });

  var colorBySequence = function() {
    plot.nucleotides.color(function(d, i) {
      var sequence = d.id.split('_')[5];
      if (sequence === 'A') {
        return 'red';
      }
      if (sequence === 'C') {
        return '#FF9500';
      }
      if (sequence === 'G') {
        return 'green';
      }
      return '#0C5DA5';
    });
    plot.nucleotides.doColor();
  };

  var normalColor = function() {
    plot.nucleotides.color(function(d, i) { return 'black'; });
    plot.nucleotides.doColor();
  };

 var motifClick = function(d, i) {
    var id = d.id;
    var link = '<a href="http://rna.bgsu.edu/rna3dhub/loops/view/' + id +
      '">' + id + '</a>';
    $('#about-selection').children().remove();
    $('#about-selection').append(link);
    $('#about-selection').show();
    return plot.jmol.showGroup(this);
  };

  plot.jmol.overflow(function() { alert("Too many nts selected"); });

  plot.brush.enabled(true)
    .update(plot.jmol.showSelection)
    .initial([[100, 36], [207, 132]]);

  plot.nucleotides.mouseover('highlight');

  plot.interactions
    .click(function(d) { console.log(d); })
    .mouseover('highlight')
    .visible(function(obj) { return obj.family === 'cWW' || obj.family === 'ncWW'; });

  plot.motifs
    .mouseover('highlight')
    .click(motifClick);

  $("#rna-2d").rna2d({
    plot: plot,
    nucleotides: {
      url: "data/16S-ecoli.json",
      parser: $.parseJSON
    },

    interactions: {
      url: "data/16S-ecoli-interactions.csv",
      parser: d3.csv.parse
    },

    motifs: {
      url: "data/2AW7_motifs.json",
      parser: $.parseJSON
    },

    controls: {
      brush: {
        selector: "#mode-checkbox"
      },
      interactions: {
        selector: ".interaction-toggle"
      },
      motifs: {
        selector: ".motif-control",
        callback: motifClick
      },
      views: {
        selector: ".view-control"
      }
    }
  });

  $('#sequence-control').on('click', function(e) {
    var $btn = $(e.target);
    $btn.button('toggle');
    if ($btn.hasClass('active')) {
      colorBySequence();
    } else {
      normalColor();
    }
  });

});
