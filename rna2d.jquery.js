(function($) {
  "use strict";


  $.fn.rna2d = function(plot, opts) {
    var options = {
      "interactions": ".toggle-control",
      "mode": "#mode-toggle",
      "view": ".view-control"
    };

    $(options.interactions).on('click', function(e) {
      var $btn = $(e.target),
      family = $btn.data('family');
      $btn.button('toggle');
      // TODO: Store plot
      plot.interactions.toggle(family);
      plot.interactions.toggle('n' + family);
    });

    $(options.mode).on('click', function(e) {
      var $btn = $(e.target);
      plot.brush.toggle();

      $btn.button('toggle');
      var text = $btn.data('normal-text');
      if ($btn.hasClass('active')) {
        text = $btn.data('loading-text');
      }
      $btn.text(text);
    });

    $(options.view).on('click', function(e) {
      var $btn = $(e.target),
      view = $btn.data('view');

      plot.view(view);

      plot.brush.clear();
      $('#' + plot.jmol.divID()).hide();

      if (view === 'airport') {
        plot.height(11/8 * plot.width());
        $("#motif-toggle").removeAttr("disabled").addClass('active');
      } else {
        plot.height(400);
        $("#motif-toggle").attr("disabled", "disabled");
      }

      $(options.view).removeClass('active');
      $btn.addClass('active');

      $(options.interactions).removeClass('active');
      $('#cWW-toggle').addClass('active');
      plot();
    });

  };

}(jQuery));
