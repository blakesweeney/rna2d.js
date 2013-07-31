function Components() {
  this._components = {};
  this._namespace = Rna2D.components;
}

Components.prototype.register = function(name, comp) {
  this._components[name] = comp;
};

Components.prototype.generate = function() {
  $.each(this._components, function(name, comp) { comp.generate(); });
};

Components.prototype.attach = function(plot) {
  var container = this;
  this._plot = plot;
  $.each(container._namespace, function(name, fn) {
    var component = fn(plot);
    container.register.call(container, component._name, component);
  });
};

Rna2D.Components = Components;

