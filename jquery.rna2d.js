(function($) {
  "use strict";

  // Generic controls
  $.fn.rna2d = function(opts) {
    var plot = opts.plot,
        options = {
          "jmol": true,
          "failed_fetch": Object,
          "chains": {
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
              'defaultVisible': ['IL', 'HL', 'J3']
            },
            "interactions": {
              "selector": ".interaction-toggle",
              'callback': Object,
              'near': true,
              'defaultVisible': ['cWW', 'ncWW']
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
    var requests = $.map(['chains', 'interactions', 'motifs'], function(type, i) {
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

  var visibleControl = function(type) {

    return function(options) {
      var plot = options.plot,
          currentlyVisible = {};

      $.each(options.defaultVisible, function(_, value) {
        currentlyVisible[value] = true;
      });

      $(options.selector).on('click', function(event) {
        var $btn = $(this);

        plot[type].visible(function(d, i) {
          var klasses = plot[type].classOf()(d, i),
              visible = false;

          if (currentlyVisible.all) {
            return true;
          }

          $.each(klasses, function(_, value) {
            if (currentlyVisible[value]) {
              visible = true;
            }
          });

          return visible;
        });

        function getKlassess(name) {
          var data = $btn.data(name);
          data = (data ? data.split(',') : []);
          if (options.near) {
            $.each(data, function(_, k) {
              data.push('n' + k);
            });
          }
          return data;
        }

        var toggleKlasses = getKlassess('toggable');

        if (!$btn.hasClass('active')) {
          toggleKlasses = toggleKlasses.concat(getKlassess('activate'));

          $.each(toggleKlasses, function(_, value) {

            $(options.selector)
              .filter("[data-toggable=" + value + "]")
              .filter(":not(#" + $btn.attr('id') + ")")
              .addClass('active');

            currentlyVisible[value] = true;
          });
        } else {
          toggleKlasses = toggleKlasses.concat(getKlassess('deactivate'));

          $.each(toggleKlasses, function(_, value) {

            $(options.selector)
              .filter("[data-toggable*=" + value + "]")
              .filter(":not(#" + $btn.attr('id') + ")")
              .removeClass('active');

            currentlyVisible[value] = false;
          });
        }

        plot[type].updateVisibility();
        options.callback(event);
      });
    };
  };

  // Interaction controls.
  $.fn.rna2d.interactions = visibleControl('interactions');

  // Motif controls.
  $.fn.rna2d.motifs = visibleControl('motifs');

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
