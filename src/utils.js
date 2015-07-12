/** @module utils */
'use strict';

/**
 * A function to generate accessor functions in an object. An accessor function
 * is one that if given no arguments returns the current value, if given one
 * argument it sets the value to the given one. The initial state of the
 * accessors, as well as the accessors to set are set in the state parameter.
 * Its keys will be used to as the names of the functions to add and the values
 * will be the initial state. If there is a property in the callback object with
 * a matching name it will be called with two arguments, the old and new values,
 * when setting the value.
 *
 * @example
 * <caption>Using this function</caption>
 * var obj = {};
 * generateAccessors(obj, {'a': 1, 'bob': true});
 * obj.a(); // => 1
 * obj.bob(false); // Sets bob to false
 * obj.bob(); // => false
 *
 * @example
 * <caption>Usage of accessor functions.</caption>
 * // Sets the value of bar to 2
 * obj.bar(2);
 *
 * // Returns 2
 * obj.bar();
 * @param {object} obj The object to add the accessor properties to.
 * @param {object} state The initial state object.
 * @param {object} callback The callback object.
 */
exports.generateAccessors = function(obj, state, callback) {
  Object.keys(state).forEach(function(key) {
    var fn = (callback ? callback[key] : null);
    exports.accessor(obj, key, state[key], fn);
  });
};

exports.accessor = function(obj, key, initial, callback) {
    obj[key] = (function() {
      var value = initial;
      return function(x) {
        if (!arguments.length) {
          return value;
        }
        var old = value;
        value = x;
        if (callback) {
          callback.call(obj, old, x);
        }
        return obj;
      };
    }());
};

/**
 * A function to attach the standard event handlers to a selection.
 *
 * @param {Selection} selection The selection to attach to.
 * @param {object} obj The object with the handlers to attach.
 */
exports.attachHandlers = function(selection, obj) {
  var handlers = ['click', 'mouseover', 'mouseout'];

  if (obj.hasOwnProperty('mouseover') && obj.mouseover() === 'highlight') {
    ['normalize', 'highlight'].forEach(function(name) {
      var fn = obj[name](),
          upper = name.charAt(0).toUpperCase() + name.slice(1);
      if (fn === Object) {
        fn = obj['default' + upper];
      }
      selection.on(handlers.pop(), fn);
    });
  }

  handlers.forEach(function(handler) {
    if (obj.hasOwnProperty(handler)) {
      selection.on(handler, obj[handler]());
    }
  });

  return selection;
};

/**
 * A function to return the value given to it. Useful in some cases.
 */
exports.identity = function(o) { return o; };
