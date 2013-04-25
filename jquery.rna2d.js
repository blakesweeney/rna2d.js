(function($) {
  "use strict";

  // Brush controls.
  $.fn.brushToggle = function(opts) {
    var plot = opts.plot,
        options = { 'callback': Object };
    $.extend(options, opts);

    this.on('click', function(event) {
      plot.brush.toggle();
      options.callback(event);
    });
  };

  // Interaction controls.
  $.fn.interactionToggle = function(opts) {
    var plot = opts.plot;
    var options = {
      'callback': Object,
      'family': 'family',
      'near': true
    };
    $.extend(options, opts);

    this.on('click', function(event) {
      var family = $(this).data(options.family);
      plot.interactions.toggle(family);
      if (options.near) {
        plot.interactions.toggle('n' + family);
      }
      options.callback(event);
    });
  };

  // Motif controls.
  $.fn.motifToggle = function(opts) {
    var plot = opts.plot;
    var options = {
      'callback': Object,
      'type': 'type'
    };
    $.extend(options, opts);

    this.on('click', function(event) {
      var type = $(this).data(options.type);
      plot.motifs.toggle(type);
      options.callback(event);
    });
  };

  // View controls.
  $.fn.viewToggle = function(opts) {
    var plot = opts.plot;
    var options = {
      'pre': Object,
      'post': Object,
      'view': 'view'
    };
    $.extend(options, opts);

    this.on('click', function(event) {
      var view = $(this).data(options.view);
      if (view === plot.view()) {
        return false;
      }
      options.pre(event);
      plot.view(view);
      plot();
      options.post(event);
    });
  };

  // Generic controls
  $.fn.rna2d = function(opts) {
    var plot = opts.plot,
        options = {
          "nts_url": false,
          "nts_parser": function(text) { },
          "interactions_url": false,
          "interactions_parser": function(text) { },
          "motifs_url": false,
          "motifs_parser": function(text) { },
          "jmol": true,
          "failed_fetch": Object
        };
    $.extend(options, opts);

    plot.selection(this.get(0).tagName.toLowerCase());

    var setter = function(type, parser) {
      return function(data, status, xhr) {
        // TODO: Handle failure

        // Parse given data
        var parsed = parser(data);
        plot[type](parsed);
      };
    };

    // If we are given urls then fire off requests for each element.
    var requests = $.map(['nts', 'interactions', 'motifs'], function(i, type) {
      var url = type + '_url';

      if (options[url]) {
        return $.get(options[url], setter(type, options[type + '_parser']));
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

}(jQuery));
