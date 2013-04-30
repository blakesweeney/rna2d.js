Rna2D.togglable = function(plot, name) {

  var type = plot[name],
      status = {};

  type.all = function(klass) {
    klass = (klass && klass !== 'all' ? klass : type['class']());
    return plot.vis.selectAll('.' + klass);
  };

  type.visible = function() {
    $.each(arguments, function(i, klass) { status[klass] = true; });
  };

  type.hidden = function() {
    $.each(arguments, function(i, klass) { status[klass] = null;  });
  };

  type.show = function(klass) {
    status[klass] = true;
    return type.all(klass).attr('visibility', function() { return 'visible'; });
  };

  type.hide = function(klass) {
    status[klass] = null;
    return type.all(klass).attr('visibility', function() { return 'hidden'; });
  };

  type.toggle = function(klass) {
    return (status[klass] ? type.hide(klass) : type.show(klass));
  };

  // Note that we use null above so here we can use the fact that jQuery's map
  // is actually a map/filter to remove elements as we traverse.
  type.visibility = function(d, i) {
    var klasses = type.classOf()(d),
        found = $.map(klasses, function(k, i) { return status[k]; });
    return (found.length ? 'visible' : 'hidden');
  };

};

