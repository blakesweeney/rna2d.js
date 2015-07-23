/**
 * @overview
 * Rna2D
 * @project Rna2D
 */

import Plot from './plot.js';
import views from './views.js';
import components from './components.js';

export default function(config) {
  var plot = new Plot(config);
  return plot
    .registerAll(components)
    .registerAll(views);
}
