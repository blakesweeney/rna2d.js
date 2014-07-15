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
    exports.accessor(obj, key, state[key], callback[key]);
  });

  // Object.keys(state).forEach(function(key) {
  //   var value = state[key];
  //   obj[key] = (function() {
  //     return function(x) {
  //       if (!arguments.length) {
  //         return state[key];
  //       }
  //       var old = state[key];
  //       state[key] = x;
  //       if (callback && callback[key]) {
  //         callback[key](old, x);
  //       }
  //       return obj;
  //     };
  //   }());
  // });
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
          callback(old, x);
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
 * A simple function to inherit from a class.
 *
 */
exports.inhert = function(Klass, name, options) {

  function Type() { Klass.call(this, name, options); }

  Type.prototype = new Klass(name, options);
  Type.prototype.constructor = Type;

  return Type;
};

/**
 * Return a function which attaches the standard handlers and sets standard
 * attributes of elements in a selection for a view. It also adds the attributes
 * that were set. The input is a component that is drawn, such as chains.
 *
 * @param {Component} type A Component to generate the function for.
 * @returns {function} A function to set attributes and handlers.
 */
exports.generateStandardViewAttrs = function(type) {
    return function(selection) {
      var klass = type['class'](),
          classOf = type.classOf();

      exports.attachHandlers(selection, type);

      return selection
        .attr('id', type.elementID())
        .attr('class', function(d, i) {
          return classOf(d, i).concat(klass).join(' ');
        })
        .attr('visibility', type.visibility())
        .call(type.applyAttrs);
    };
};
