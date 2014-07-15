/** @module component */
'use strict';

var utils = require('./utils');

/**
 * Create a new Component.
 *
 * @constructor
 * @this {Component}
 * @param {String} name The name of the component.
 * @param {Object} config The config object for this component. All items in
 * config will be given an accessor in this component.
 */
var Component = function(name, config) {
  /** The name of this component. */
  this._name = name;

  /** The plot this Component is a part of */
  this.plot = null;

  if (!config.hasOwnProperty('render')) {
    config.render = true;
  }
  utils.generateAccessors(this, config);
};

/**
 * Attach the given plot to this component. This will copy over all 
 *
 * @param {Plot} plot The plot to attach.
 */
Component.prototype.attach = function(plot) {

  this.plot = plot;

  (function(prop) {
    var data = null;
    plot[prop] = function(x) {
      if (!arguments.length) {
        return data;
      }
      data = x;
      return plot[prop];
    };
  }(this._name));

  // Mixin all properties
  var prop;
  for(prop in this) {
    if (this.hasOwnProperty(prop) && prop[0] !== '_') {
      plot[this._name][prop] = this[prop];
    }
  }
};

/**
 * Generate the component. This will check if we should draw it, using .draw,
 * then we check if we have a .plot attribute as this is often used when
 * drawing. Then we call the .render() method which computes if we should draw
 * or not. If so we go ahead and call .draw to do the actual drawing.
 *
 * @this {Component}
 * @returns {Component} Returns this Component.
 */
Component.prototype.generate = function() {
  if (!this.draw) {
    return false;
  }

  if (!this.plot) {
    console.log('Must setup ' + this._name + ' component prior to drawing');
    return false;
  }

  try {
    return (this.render() ? this.draw() : false);
  } catch (except) {
    console.log('Could not generate component: ' + this._name);
    console.log(except);
  }
  return this;
};

/**
 * Stub implementation of drawing. Does nothing.
 *
 * @this {Component}
 * @abstract
 */
Component.prototype.draw = function() {
  return null;
};

module.exports = Component;
