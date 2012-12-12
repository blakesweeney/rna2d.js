Rna2D.utils = function() {
  var my = {};

  my.distance = function(a, b) {
    return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
  };

  // my.merge = function(update, old) {
  //   for(var key in old) {
  //     var val = old[key];
  //     if (typeof(val) == 'object') {
  //       update[key]  = merge(update[key] || {}, val);
  //     } else {
  //       update[key] = val;
  //     }
  //   }
  //   return update;
  // };

  my.element = function(id) { 
    return document.getElementById(id); 
  };

  return my;
}();
