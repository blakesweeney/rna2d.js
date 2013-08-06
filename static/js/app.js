$(document).ready(function() {
  "use strict";
  /*global alert, Rna2D, d3, $ */

  $('.chzn-select').chosen();

  var pdb = '2AVY',
      plot = Rna2D({ view: 'airport', width: 630, height: 795 });

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
    plot.nucleotides.colorize();
  };

  var normalColor = function() {
    plot.nucleotides.color(function(d, i) { return 'black'; });
    plot.nucleotides.colorize();
  };

 var motifClick = function(d, i) {
    var id = d.id,
        nts = plot.motifs.nucleotides(this).data(),
        link = '<a href="http://rna.bgsu.edu/rna3dhub/loops/view/' + id +
               '">' + id + '</a>';
    $('#about-selection').children().remove();
    $('#about-selection').append(link);
    $('#about-selection').show();
    return plot.jmolTools.motifs()(d, i);
  };

  plot.jmolTools
    .overflow(function() { alert("Too many nts selected"); });

  plot.brush.enabled(true)
    .update(plot.jmolTools.brush());

  plot.nucleotides.mouseover('highlight')
    .click(plot.jmolTools.nucleotides())
    .getNumber(function(d) { return d.id.split('_')[4]; })
    .encodeID(function(id) { return id.replace(/\|/g, '_').toLowerCase(); });

  plot.interactions
    .click(plot.jmolTools.interactions())
    .mouseover('highlight')
    ;

  plot.motifs
    .mouseover('highlight')
    .click(motifClick);

  $("#rna-2d").rna2d({
    plot: plot,
    chains: {
      url: "data/2AW7/chains.json",
      parser: $.parseJSON
    },

    interactions: {
      url: "data/2AW7/interactions.csv",
      parser: d3.csv.parse
    },

    motifs: {
      url: "data/2AW7/motifs.json",
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
        selector: ".motif-control"
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

  $("#all-toggle").on('click', function(e) {
    var $btn = $(this),
        toggles = $(".interaction-toggle")
          .filter(":not(#all-toggle)")
          .filter(":not(#cWW-toggle)");

    if ($btn.hasClass('active')) {
      toggles.removeClass('active');
    } else {
      toggles.addClass('active');
    }
  });

  $(".interaction-toggle").on('click', function(e) {
    var $btn = $(this);
    if ($btn.attr('id') !== 'all-toggle') {
      $("#all-toggle").removeClass('active');
    }
  });

  // TODO: Should do something to simplify this. Possibly make these functions
  // accessible outside the jquery plugin. Or I could add this control to the
  // plugin.
  $("#structure-select").change(function(event) {
    var pdbID = $(this).find(':selected').text();
    if (pdbID === pdb) {
      return true;
    }
    pdb = pdbID;

    var urls = {
      chains: {
        url: 'data/' + pdbID + '/chains.json',
        parser: $.parseJSON
      },
      interactions: {
        url: 'data/' + pdbID + '/interactions.csv',
        parser: d3.csv.parse
      },
      motifs: {
        url: 'data/' + pdbID + '/motifs.json',
        parser: $.parseJSON
      }
    };

    var setter = function(type, parser) {
      return function(data, status, xhr) {
        try {
          var parsed = parser(data);
          plot[type](parsed);
        } catch(err) {
          console.log("Error caught when trying to parse loaded data for " + type);
          console.log(err);
        }
      };
    };

    var requests = $.map(['chains', 'interactions', 'motifs'], function(type, i) {
      if (urls[type].url) {
        return $.ajax({
          url: urls[type].url,
          success: setter(type, urls[type].parser),
          dataType: "text"
        });
      }

      return null;
    });

    $.when.apply($, requests).done(plot);
  });

});
