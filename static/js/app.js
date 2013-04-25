$(document).ready(function() {
  "use strict";
  /*global alert, Rna2D, d3, $ */

  var plot = Rna2D({ width: 630, height: 795 });
  plot.view('airport');

  plot.jmol.overflow(function() { alert("Too many nts selected"); });

  plot.brush.enabled(true)
    .update(plot.jmol.showSelection)
    .initial([[100, 36], [207, 132]]);

  plot.nucleotides.mouseover('highlight');

  plot.interactions
    .mouseover('highlight')
    .visible(function(obj) { return obj.family === 'cWW'; });

  plot.motifs.mouseover('highlight');

  d3.json('data/16S-ecoli.js', function(data) {
    plot.nucleotides(data);

    d3.csv('data/16S-ecoli-interactions.csv', function(data) {
      plot.interactions(data);

      d3.json('data/2AW7_motifs.json', function(data) {
        plot.motifs(data);

        plot();
      });
    });
  });

  $('#mode-checkbox').brushToggle({plot: plot});
  $(".interaction-checkbox").interactionToggle({plot: plot});
  $(".motif-checkbox").motifToggle({plot: plot});
  $(".view-control").viewToggle({plot: plot});

});
