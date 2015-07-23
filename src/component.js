/** @module component */

import { functor } from './utils';

/**
 * A base class for things that should have accessible properties. Each
 * property may have an assigned callback. This callback will receive the old
 * and new values after the values have changed.
 */
export class Accessible {

  /**
   * Create a new Accessible object.
   *
   * @param {Map} config A map of the objects to create accessors for. All key
   * value pairs in the map will have accessors created for them. This will
   * assume that there is no callback to add for each key. To add a callback
   * for changing the value use the setCallback method.
   */
  constructor(config) {
    this._config = new Map();
    config.forEach((value, key) => this.addAccessor(key, value, Object));
  }

  /**
   * Set the callback for a given key. The callback will be called after a
   * key's value is set.
   *
   * @param {String} key The key to set a callback for.
   * @param {Function} callback The callback to use.
   */
  setCallback(key, callback) {
    let current = this._config.get(key);
    current[1] = callback;
    this._config.set(key, current);
  }

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

  /**
   * Create a new accessor for this object.
   *
   * @param {String} key The key to create an accessor for.
   * @param {Any} value The value for the accessor.
   * @param {Function} callback The callback to use for this accessor. If none
   * is given it defaults to Object.
   */
  addAccessor(key, value, callback) {
    this._config.set(key, [value, callback || Object]);

    this[key] = (x) => {
      if (x === undefined) {
        return this._config.get(key)[0];
      }

      const [old, func] = this._config.get(key);
      this._config.set(key, [x, func]);
      func(old, x);
      return this;
    };
  }

}

/**
 * This is a class that contains much of the generic behavior for many of the
 * parts of a plot.
 */
export class Component extends Accessible {

  /**
   * Create a new Component.
   *
   * @constructor
   * @this {Component}
   * @param {Plot} plot The plot to bind this component to.
   * @param {String} name The name of the component.
   * @param {Map} config The config object for this component. All items in
   * config will be given an accessor in this component.
   */
  constructor(plot, name, config) {
    const accessors = new Map(config.entries());
    if (!accessors.has('render')) {
      accessors.set('render', true);
    }

    super(accessors);
    this.plot = plot;
    this._name = name;
  }

  /**
   * Stub implementation of drawing. Does nothing.
   *
   * @this {Component}
   * @abstract
   */
  draw() {
    return null;
  }

  /**
   * Generate the component. This will check if we should draw it, using .draw,
   * then we check if we have a .plot attribute as this is often used when
   * drawing. Then we call the .render() method which computes if we should draw
   * or not. If so we go ahead and call .draw to do the actual drawing.
   *
   * @this {Component}
   * @returns {Component} Returns this Component.
   */
  generate() {
    if (!this.plot) {
      console.log(`Must attach a plot to ${this._name} prior to drawing`);
      return this;
    }

    try {
      if (this.render()) {
        this.draw();
      }
    } catch (except) {
      console.log('Could not generate component: ' + this._name);
      console.log(except);
    }

    return this;
  }
}

/**
 * This is a class representing the parts of a plot that have data assigned to
 * them such as nucleotides, interactions and motifs.
 *
 * @class
 */
export class DataComponent extends Component {
  constructor(plot, name, given) {
    const config = new Map(given.entries());
    config.set('data', []);
    if (!config.has('visible')) {
      config.set('visible', true);
    }

    super(plot, name, config);
    this._attrs = {};
  }

  elementID() {
    const getID = this.getID();
    const encodeID = this.encodeID();
    return (d, i) => encodeID(getID(d, i));
  }

  attr(key, value) {
    this._attrs[key] = value;
    return this;
  }

  applyAttrs(selection) {
    selection.attr(this._attrs);
  }

  all(given) {
    const klass = (given && given !== 'all' ? given : this.class());
    return this.plot.vis.selectAll('.' + klass);
  }

  visibility() {
    const isVisible = functor(this.visible());
    return (d, i) => (isVisible(d, i) ? 'visible' : 'hidden');
  }

  updateVisibility() {
    this.all().attr('visibility', this.visibility());
  }

  colorByNT(mapping, options) {
    const getID = this.getID();
    return (d, i) => (mapping[getID(d, i)] ? options.match : options.mismatch);
  }

  colorize(coloring) {
    return this.all().attr('fill', coloring || this.color());
  }

  colorExcept(mapping, given) {
    const standard = { match: 'black', mismatch: 'red' };
    const options = Object.assign({}, standard, given || {});
    this.colorByNT(mapping, options);
  }

  colorOnly(mapping, given) {
    const standard = { match: 'red', mismatch: 'black' };
    const options = Object.assign({}, standard, given || {});
    this.colorByNT(mapping, options);
  }

  colorByAttribute(attribute, fn) {
    let func = fn;
    if (fn === undefined) {
      func = (v) => v;
    }

    return (d) => func(d[attribute]);
  }

  valid(func) {
    const seen = new Set();
    const getId = this.getID();

    return this
      .data()
      .filter((d, i) => {
        const id = getId(d, i);
        if (!seen.has(id) && func(d, i)) {
          seen.add(id);
          return true;
        }
        return false;
      });
  }
}
