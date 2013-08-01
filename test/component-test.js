test("Basic component setup", function() {
  var Type = Rna2D.setupComponent('type', { count: 1 });
  Type.prototype.draw = function() {
    return 'drawn';
  };

  var obj = new Type(),
      plot = {};

  equal(obj._name, 'type', 'Check name');

  equal(obj.count(), 1, 'Check sets accessor');

  obj.count(2);
  equal(obj.count(), 2, 'Check updates accessor');

  equal(obj.render(), true, 'Check render defaults to true');

  equal(obj.generate(), false, 'Check does not draw without plot');

  obj.attach(plot);
  equal(plot.type(), null, 'Check adds datastore');

  plot.type('a');
  equal(plot.type(), 'a', 'Check datastore works');

  equal(obj.generate(), 'drawn', 'Runs draw by default');

  obj.render(false);
  equal(obj.generate(), false, 'Check does not draw if render is false');

  plot.type.count(3);
  equal(plot.type.count(), 3, 'Check this correctly attaches handlers');
  equal(obj.count(), 3, 'Check attached handlers work');
});
