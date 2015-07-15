/** @module components/brush */
'use strict';

import d3 from 'd3';
import { Component } from '../component.js';

export default class Brush extends Component {

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
  constructor(plot) {
    super(plot, 'brush', new Map([
      ['enabled', true],
      ['class', 'brush'],
      ['update', Object],
      ['clear', Object]
    ]));
  }

  /**
   * Enable the brush. This adds a selection for the brush as needed.
   * @this {Brush}
   */
  enable() {
    this.plot.vis.append('g')
      .classed(this.plot.brush.class(), true)
      .call(this.plot.brush());
    this.enabled(true);
    return this;
  }

  /**
   * Disable the brush. This will remove the brush selection if one exists.

   * @this {Brush}
   */
  disable() {
    this.plot.vis.selectAll('.' + this.class()).remove();

    // this.plot.vis.selectAll('.' + this.plot.brush['class']()).remove();
    this.enabled(false);
    return this;
  }

  /**
   * Toggle brush state.
   *
   * @this {Brush}
   */
  toggle() {
    return (this.enabled() ? this.disable() : this.enable());
  }

  /**
   * Draw the brush. This will generate the brush selection and attach listners
   * as needed to the brush. If enabled() is true then the brush will be
   * enabled as well.
   *
   * @this {Brush}
   */
  draw() {

    let scale = (given) => d3.scale.identity().domain(given.domain());
    let plot = this.plot;
    let brush = d3.svg.brush()
        .x(scale(plot.xScale()))
        .y(scale(plot.yScale()));

    brush.on('brushend', () => {
      let nts = [];
      let extent = brush.extent();

      if (brush.empty()) {
        return plot.brush.clear()();
      }

      plot.vis.selectAll('.' + plot.nucleotides.class())
        .attr('selected', (d) => {
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
  }
}
