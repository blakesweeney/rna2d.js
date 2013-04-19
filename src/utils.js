Rna2D.utils = (function() {
  var my = {};

  my.distance = function(a, b) {
    return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
  };

  my.generateAccessors = function(obj, state, callback) {
    _.each(state, function(value, key) {
      obj[key] = (function() {
        return function(x) {
          if (!arguments.length) {
            return state[key];
          }
          var old = state[key];
          state[key] = x;
          if (callback && callback[key]) {
            callback[key](old, x);
          }
          return obj;
        };
      }());
    });
  };

  my.attachHandlers = function(selection, obj) {
    var handlers = ['click', 'mouseover', 'mouseout'];

    if (obj.mouseover() === 'highlight') {
      handlers = [handlers[0]];
      selection
        .on('mouseover', obj.highlight())
        .on('mouseout', obj.normalize());
    }

    _.each(handlers, function(handler) {
      selection.on(handler, obj[handler]);
    });

    return selection;
  };

  my.element = function(id) {
    return document.getElementById(id);
  };

  return my;
}());

