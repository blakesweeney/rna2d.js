/** @module components/frame */
'use strict';

var Component = require('../component.js'),
    DEFAULTS = {
      add: true,
      'class': 'frame'
    };

function Frame() { Component.call(this, 'frame', DEFAULTS); }
Frame.prototype = Object.create(Component.prototype);
Frame.prototype.constructor = Frame;

Frame.prototype.draw = function() {
  var plot = this.plot;
  return plot.vis.append('svg:rect')
    .classed(plot.frame['class'](), true)
    .attr('x', -plot.margin().left)
    .attr('y', -plot.margin().above)
    .attr('width', plot.width() + plot.margin().left + plot.margin().right)
    .attr('height', plot.height() + plot.margin().above + plot.margin().below)
    .attr('fill', 'none')
    .attr('fill-opacity', 0)
    .style('pointer-events', 'none');
};

module.exports = Frame;
