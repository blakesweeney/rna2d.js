(function($) {
  "use strict";

  // Generic controls
  $.fn.rna2d = function(opts) {
    var plot = opts.plot,
        options = {
          "jmol": true,
          "failed_fetch": Object,
          "nucleotides": {
            "url": false,
            "parser": function(text) { },
          },
          "interactions": {
            "url": false,
            "parser": function(text) { },
          },
          "motifs": {
            "url": false,
            "parser": function(text) { },
          },
          "controls": {
            "brush": {
              "selector": "#brush-toggle"
            },
            "motifs": {
              "selector": ".motif-toggle"
            },
            "interactions": {
              "selector": ".interaction-toggle"
            },
            "views": {
              "selector": ".view-toggle"
            }
          }
        };
    $.extend(options, opts);

    plot.selection(this.get(0));

    // Attach handlers to each control.
    $.each(options.controls, function(type, given) {
      given.plot = plot;
      $(given.selector).rna2d[type](given);
    });

    var setter = function(type, parser) {
      return function(data, status, xhr) {
        // TODO: Handle failure

        // Parse given data
        try {
          var parsed = parser(data);
          plot[type](parsed);
        } catch(err) {
          console.log("Error caught when trying to parse loaded data for " + type);
          console.log(err);
        }
      };
    };

    // If we are given urls then fire off requests for each element.
    var requests = $.map(['nucleotides', 'interactions', 'motifs'], function(type, i) {
      if (options[type].url) {
        return $.get(options[type].url, setter(type, options[type].parser));
      }

      return null;
    });

    // Draw if we have nothing to fetch.
    if (requests.length === 0) {
      plot();
    } else {
      // Otherwise wait until all requests are done to attempt to draw.
      $.when.apply($, requests).done(plot);
    }

  };

  // Brush controls.
  $.fn.rna2d.brush = function(opts) {
    var plot = opts.plot,
        options = { 'callback': Object };
    $.extend(options, opts);

    $(options.selector).on('click', function(event) {
      plot.brush.toggle();
      options.callback(event);
    });
  };

  // Interaction controls.
  $.fn.rna2d.interactions = function(opts) {
    var plot = opts.plot;
    var options = {
      'callback': Object,
      'data': 'family',
      'near': true
    };
    $.extend(options, opts);

    $(options.selector).on('click', function(event) {
      var family = $(this).data(options.data);
      plot.interactions.toggle(family);
      if (options.near) {
        plot.interactions.toggle('n' + family);
      }
      options.callback(event);
    });
  };

  // Motif controls.
  $.fn.rna2d.motifs = function(opts) {
    var plot = opts.plot;
    var options = {
      'callback': Object,
      'data': 'type'
    };
    $.extend(options, opts);

    $(options.selector).on('click', function(event) {
      var type = $(this).data(options.data);
      plot.motifs.toggle(type);
      options.callback(event);
    });
  };

  // View controls.
  $.fn.rna2d.views = function(opts) {
    var plot = opts.plot;
    var options = {
      'pre': Object,
      'post': Object,
      'data': 'view'
    };
    $.extend(options, opts);

    $(options.selector).on('click', function(event) {
      var view = $(this).data(options.data);
      if (view === plot.view()) {
        return false;
      }
      options.pre(event);
      plot.view(view);
      plot();
      options.post(event);
    });
  };

}(jQuery));
