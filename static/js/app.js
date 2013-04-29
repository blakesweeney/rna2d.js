$(document).ready(function() {
  "use strict";
  /*global alert, Rna2D, d3, $ */

  var plot = Rna2D({ view: 'airport', width: 630, height: 795 });

  plot.jmol.overflow(function() { alert("Too many nts selected"); });

  plot.brush.enabled(true)
    .update(plot.jmol.showSelection)
    .initial([[100, 36], [207, 132]]);

  plot.nucleotides.mouseover('highlight');

  plot.interactions
    .mouseover('highlight')
    .visible(function(obj) { return obj.family === 'cWW'; });

  plot.motifs.mouseover('highlight');

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
        selector: ".interaction-checkbox"
      },
      motifs: {
        selector: ".motif-checkbox"
      },
      views: {
        selector: ".view-control"
      }
    }
  });

});
