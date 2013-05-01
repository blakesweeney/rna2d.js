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
              "selector": "#brush-toggle",
              "callback": Object
            },
            "motifs": {
              "selector": ".motif-toggle",
              'callback': Object,
              'data': 'type'
            },
            "interactions": {
              "selector": ".interaction-toggle",
              'callback': Object,
              'data': 'family',
              'near': true
            },
            "views": {
              "selector": ".view-toggle",
              'pre': Object,
              'post': Object,
              'data': 'view'
            }
          }
        };
    $.extend(true, options, opts);

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
        return $.ajax({
          url: options[type].url, 
          success: setter(type, options[type].parser),
          dataType: "text"
        });
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
  $.fn.rna2d.brush = function(options) {
    var plot = options.plot;

    $(options.selector).on('click', function(event) {
      plot.brush.toggle();
      options.callback(event);
    });
  };

  // Interaction controls.
  $.fn.rna2d.interactions = function(options) {
    var plot = options.plot;

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
  $.fn.rna2d.motifs = function(options) {
    var plot = options.plot;

    $(options.selector).on('click', function(event) {
      var type = $(this).data(options.data);
      plot.motifs.toggle(type);
      options.callback(event);
    });
  };

  // View controls.
  $.fn.rna2d.views = function(options) {
    var plot = options.plot;

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
