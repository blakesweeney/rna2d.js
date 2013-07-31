// TODO: Inhert from component
function View(name, config) {
  this._name = name;
  this.domain = { x: null, y: null };
  Rna2D.utils.generateAccessors(this, config);
}

View.prototype = {
  attach: function(plot) {

    plot[this._name] = {};

    this.plot = plot;

    var prop;
    for(prop in this) {
      if (this.hasOwnProperty(prop) && prop[0] !== '_') {
        plot[this._name][prop] = this[prop];
      }
    }
  },

  generate: function(){
    this.update();
    this.coordinates();
    this.connections();
    this.groups();
    this.labels();
  },

  drawStandard: function(type) {
    return function(selection) {
      var klass = type['class'](),
          classOf = type.classOf();

      Rna2D.utils.attachHandlers(selection, type);

      return selection.attr('id', type.elementID())
        .attr('class', function(d, i) {
          return classOf(d, i).concat(klass).join(' ');
        })
        .attr('visibility', type.visibility);
    };
  },

  standardCoordinates: function() {
    var self = this;
    return function(selection) {
      var x = self.xCoord(),
          y = self.yCoord();

      return self.drawStandard(self.plot.nucleotides)(selection)
        .datum(function(d, i) {
          d.__x = x(d, i);
          d.__y = y(d, i);
          return d;
        });
    };
  },

  standardConnections: function() {
    return this.drawStandard(this.plot.interactions);
  },

  standardGroups: function() {
    return this.drawStandard(this.plot.motifs);
  },

  standardLabels: function() {
    return this.drawStandard(this.plot.labels);
  },

  xDomain: function() { return this.domain.x; },

  yDomain: function() { return this.domain.y; },

  labels: function() { return false; },
  xCoord: function() { return false; },
  yCoord: function() { return false; },
  update: function() { return false; },
  groups: function() { return false; },
  preprocess: function() { return false; },
  coordinates: function() { return false; },
  connections: function() { return false; },
};

Rna2D.View = View;

Rna2D.setupView = function(name, config) {
  function Type() {
    Rna2D.View.call(this, name, config);
  }

  Type.prototype = new Rna2D.View(name, config);
  Type.prototype.constructor = Type;

  return Type;
};

function Views() { 
  Components.call(this);
  this._namespace = Rna2D.views;
}

Views.prototype = new Components();
Views.prototype.constructor = Views;

Views.prototype.current = function() {
  var plot = this._plot,
      name = plot.view();

  if (!this._components.hasOwnProperty(name)) {
    console.log("Unknown view " + plot.view());
    return false;
  }

  return this._components[name];
};

Rna2D.Views = Views;

