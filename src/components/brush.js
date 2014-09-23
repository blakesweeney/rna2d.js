/** @module components/brush */
'use strict';

var d3 = require('d3'),
    Component = require('../component.js'),
    DEFAULTS = {
      enabled: true,
      'class': 'brush',
      update: Object,
      clear: Object
    };

/**
 * Create a new Brush.
 *
 * @constructor
 * @this {Brush}
 * @property {boolean} enabled Flag if the brush is enabled.
 * @property {string} class The css class to give the brush object.
 * @property {function} update The callback for when the brush is updated.
 * @property {function} clear The callback for when the brush is cleared.
 */
var Brush = function() { Component.call(this, 'brush', DEFAULTS); };
Brush.prototype = Object.create(Component);
Brush.prototype.constructor = Brush;

/** 
 * Enable the brush. This adds a selection for the brush as needed.

 * @this {Brush}
 */
Brush.prototype.enable = function() {
  this.plot.vis.append('g')
    .classed(this.plot.brush['class'](), true)
    .call(this.plot.brush());
  this.enabled(true);
  return this;
};

/**
 * Disable the brush. This will remove the brush selection if one exists.

 * @this {Brush}
 */
Brush.prototype.disable = function() {
  this.plot.vis.selectAll('.' + this['class']()).remove();
  // this.plot.vis.selectAll('.' + this.plot.brush['class']()).remove();
  this.enabled(false);
  return this;
};

/**
 * Toggle brush state.
 *
 * @this {Brush}
 */
Brush.prototype.toggle = function() {
  return (this.enabled() ? this.disable() : this.enable());
};

/**
 * Draw the brush. This will generate the brush selection and attach listners as
 * needed to the brush. If enabled() is true then the brush will be enabled as
 * well.
 *
 * @this {Brush}
 */
Brush.prototype.draw = function() {

  var scale = function(given) {
      return d3.scale.identity().domain(given.domain());
    }, 
    plot = this.plot,
    brush = d3.svg.brush()
      .x(scale(plot.xScale()))
      .y(scale(plot.yScale()));

  brush.on('brushend', function () {
    var nts = [],
        extent = brush.extent();

    if (brush.empty()) {
      return plot.brush.clear()();
    }

    plot.vis.selectAll('.' + plot.nucleotides['class']())
      .attr('selected', function(d) {
        if (extent[0][0] <= d.__x && d.__x <= extent[1][0] &&
            extent[0][1] <= d.__y && d.__y <= extent[1][1]) {
          nts.push(d);
          return 'selected';
        }
        return '';
      });

    return this.plot.brush.update()(nts);
  });

  this.plot.brush(brush);

  if (this.enabled()) {
    this.enable();
  }

  return this;
};

module.exports = Brush;
