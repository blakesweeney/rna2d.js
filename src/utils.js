Rna2D.utils = (function() {
  var my = {};

  my.generateAccessors = function(obj, state, callback) {
    $.each(state, function(key, value) {
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

    if (obj.hasOwnProperty('mouseover') && obj.mouseover() === 'highlight') {
      selection
        .on(handlers.pop(), obj.normalize())
        .on(handlers.pop(), obj.highlight());
    }

    $.each(handlers, function(i, handler) {
      if (obj.hasOwnProperty(handler)) {
        selection.on(handler, obj[handler]());
      }
    });

    return selection;
  };

  return my;
}());

