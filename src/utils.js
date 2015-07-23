/** @module utils */
/**
 * A function to attach the standard event handlers to a selection.
 *
 * @param {Selection} selection The selection to attach to.
 * @param {object} obj The object with the handlers to attach.
 */
export function attachHandlers(selection, obj) {
  var handlers = ['click', 'mouseover', 'mouseout'];

  if (obj.hasOwnProperty('mouseover') && obj.mouseover() === 'highlight') {
    ['normalize', 'highlight'].forEach(function(name) {
      let fn = obj[name]();
      const upper = name.charAt(0).toUpperCase() + name.slice(1);
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
}

export function functor(value) {
  return (typeof value === 'function' ? value : () => value);
}
