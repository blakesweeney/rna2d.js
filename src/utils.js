Rna2D.utils = (function() {
  var my = {};

  my.distance = function(a, b) {
    return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
  };

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

    if (obj.mouseover() === 'highlight') {
      selection
        .on(handlers.pop(), obj.normalize())
        .on(handlers.pop(), obj.highlight());
    }


    $.each(handlers, function(i, handler) {
      selection.on(handler, obj[handler]());
    });

    return selection;
  };

  // Get an element by id.
  my.element = function(id) {
    return document.getElementById(id);
  };

  // Not very good compose function. The idea is compose(f, g, h)(a) == h(g(f(a)))
  my.compose = function() {
    // Why can't jquery have some more nice functional tools like reduce and
    // compose?
    var funcs = arguments;
    return function() {
      var res = arguments;
      $.each(funcs, function(i, fn) { res = [fn.apply(this, res)]; });
      return res;
    };
  };

  return my;
}());

