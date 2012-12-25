Rna2D.utils = function() {
  var my = {};

  my.distance = function(a, b) {
    return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
  };

  my.generateAccessors = function(obj, state, callback) {
    d3.keys(state).forEach(function(key) {

      obj[key] = function(x) {
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

    });
  };

  my.attachHandlers = function(selection, obj) {
    (['mouseover', 'mouseout', 'click']).forEach(function(handler) {
      if (obj[handler]) {
        selection.on(handler, obj[handler]);
      }
    });
    return selection;
  };

  my.extend = function(update, old) {
    for(var key in old) {
      update[key] = old[key];
    }
    return update;
  };

  my.element = function(id) {
    return document.getElementById(id);
  };

  return my;
}();

