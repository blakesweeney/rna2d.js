/** @module components/nucleotides */

import { DataComponent } from '../component.js';

/**
 * The Nucleotide class is meant to represent nucleotides for drawing in a 2D.
 * This class controls the behavior and display of all nucleotides. There
 * should only be one instance of this class for each 2D diagram. Individual
 * nucleotides are represented by javascript objects, not instances of this
 * class.
 *
 * This class will have several accessors which are used for getting data from
 * the individual nucleotide objects for plotting. Each accessor is
 * configurable and may be either a function which takes 2 arguments, the data
 * and index of the nucleotide in question or a constant.
 *
 * The Nucleotide object will have accessors for:
 *
 * :click: The callback to trigger when a nucleotide is clicked. Default
 * Object.
 * :mouseover: The callback to trigger when the mouse is over a nucleotide.
 * Default Object.
 * :mouseout: The callabck to trigger when the mouse leaves a nucleotide.
 * Default Object.
 * :visible: A flag to indicate a nucleotide should be visible or not. Default
 * true.
 * :highlight: The callback to trigger for highlighting a nucleotide.
 */
export default class Nucleotides extends DataComponent {

  constructor(plot) {
    super(plot, 'nucleotides', new Map([
      ['click', Object],
      ['mouseover', Object],
      ['mouseout', Object],
      ['visible', true],
      ['highlight', Object],
      ['normalize', Object],
      ['highlightColor', 'red'],
      ['getID', (d) =>  d.id],
      ['class', 'nucleotide'],
      ['classOf', (d) => [d.sequence]],
      ['getX', (d) => d.x],
      ['getY', (d) =>  d.y],
      ['encodeID', (id) => id],
      ['getSequence', (d) => d.sequence],
      ['getNumber', (d) =>  d.id.split('|')[4]],
      ['color', 'black'],
    ]));

    this.addAccessor('normalize', (d, i) => {
      this.plot.currentView().clearHighlightLetters();
      this.plot.nucleotides.interactions(d, i).style('stroke', null);
    });

    this.addAccessor('highlight', (d, i) => {
      const highlightColor = this.plot.highlights.color()(d, i);
      this.plot.currentView().highlightLetters([d]);
      this.plot.nucleotides
        .interactions(d, i)
        .style('stroke', highlightColor);
    });
  }

  /**
   * A method for getting all interactions that involve this nucleotide.
   *
   * The function takes two arguments, the data and index of the nucleotide in
   * question and will return all interaction data in the plot which uses this
   * nucleotide.
   */
  interactions(inter, index) {
    const id = this.getID()(inter, index);
    const getNTs = this.plot.interactions.getNTs();
    return this.plot.vis.selectAll('.' + this.plot.interactions.class())
      .filter((d) => getNTs(d).indexOf(id) !== -1);
  }
}
