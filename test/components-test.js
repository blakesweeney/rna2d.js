function StandardTests(plot, name, accessor, value) {
  if (!accessor) {
    accessor = 'color';
    value = 'black';
  }

  //console.log(name, plot[name]);
  equal(plot[name](), null, "Check adds datastore to plot");

  equal(plot[name][accessor](), value, 'Check adds accessors');
  
  plot[name][accessor]('bob');
  equal(plot[name][accessor](), 'bob', 'Check accessors works');

  equal(plot.components[name].generate, Rna2D.Component.prototype.generate,
        'Check adds generate');
}

test("Nucleotides", function () {
  var plot = {};
  Rna2D.components.nucleotides(plot);

  StandardTests(plot, 'nucleotides');

  equal(plot.components.nucleotides.generate(), false,
        "Check does nothing for plotting");
});

test("Interactions", function() {
  var plot = {};
  Rna2D.components.interactions(plot);

  StandardTests(plot, 'interactions');

  equal(plot.components.interactions.generate(), false,
        "Check does nothing for plotting");
});

test("Motifs", function() {
  var plot = {};
  Rna2D.components.motifs(plot);

  StandardTests(plot, 'motifs', 'click', Object);

  equal(plot.components.motifs.generate(), false,
        "Check does nothing for plotting");
});

test("Chain", function() {
  var plot = {};
  Rna2D.components.chains(plot);

  StandardTests(plot, 'chains', 'class', 'chain');

  equal(plot.components.chains.generate(), false,
        "Check does nothing for plotting");
});

test("Brush", function() {
  var plot = {};
  Rna2D.components.brush(plot);

  StandardTests(plot, 'brush', 'update', Object);
});

test("Frame", function() {
  var plot = {};
  Rna2D.components.frame(plot);

  StandardTests(plot, 'frame', 'add', true);
});

test("jmolTools", function() {
  var plot = {};
  Rna2D.components.jmolTools(plot);

  StandardTests(plot, 'jmolTools', 'divID', 'jmol');
});

test("Zoom", function() {
  var plot = {};
  Rna2D.components.zoom(plot);

  StandardTests(plot, 'zoom', 'onChange', Object);
});
