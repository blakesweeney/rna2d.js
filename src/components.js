function Component(name, config) {
  this._name = name;
  this._parent = Component;

  if (!config.hasOwnProperty('render')) {
    config.render = true;
  }
  Rna2D.utils.generateAccessors(this, config);
}

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

Component.prototype.generate = function() {
  if (!this.draw) {
    return false;
  }

  if (!this.plot) {
    console.log("Must setup " + this._name + " component prior to drawing");
    return false;
  }

  try {
    return (this.render() ? this.draw() : false);
  } catch (except) {
    console.log("Could not generate component: " + this._name);
    console.log(except);
  }
};

Rna2D.Component = Component;

function inhert(klass, name, options) {

  function Type() {
    klass.call(this, name, options);
  }

  Type.prototype = new klass(name, options);
  Type.prototype.constructor = Type;

  return Type;
}

Rna2D.withIdElement = function() {
  var self = this;
  this.elementID = function() {
    var getID = self.getID(),
        encodeID = self.encodeID();
    return function(d, i) {
      return encodeID(getID(d, i));
    };
  };
};

Rna2D.withNTElements = function(plot) {
  var self = this;
  this.ntElements = function() {
    var getNTs = self.getNTs(),
        encodeID = plot.nucleotides.encodeID();
    return function(d, i) {
      return $.map(getNTs(d, i), encodeID);
    };
  };

  this.nucleotides = function(d, i) {
    var nts = self.getNTs()(d, i),
        idOf = plot.nucleotides.getID();
    return plot.vis.selectAll('.' + plot.nucleotides['class']())
      .filter(function(d, i) { return $.inArray(idOf(d, i), nts) !== -1; });
  };
};

Rna2D.withInteractions = function(plot) {
  var self = this;

  this.interactions = function(d, i) {
    var id = self.getID()(d, i),
        getNTs = plot.interactions.getNTs();
    return plot.vis.selectAll('.' + plot.interactions['class']())
      .filter(function(d, _) { return $.inArray(id, getNTs(d)) !== -1; });
  };
};

Rna2D.asToggable = function(plot) {
  var type = this;

  type.all = function(klass) {
    klass = (klass && klass !== 'all' ? klass : type['class']());
    return plot.vis.selectAll('.' + klass);
  };

  type.visibility = function() {
    var isVisible = type.visible();
    return function(d, i) {
      return (isVisible(d, i) ? 'visible' : 'hidden'); };
  };

  type.updateVisibility = function() {
    type.all().attr('visibility', type.visibility());
  };
};

Rna2D.asColorable = function() {
  var self = this;
  this.colorize = function() {
    return self.all().attr('fill', self.color());
  };
};

Rna2D.withAttrs = function() {
  var self = this;
  this._attrs = {};
  this.attr = function(key, value) {
    self._attrs[key] = value;
    return self;
  };

  this.applyAttrs = function(selection) {
    $.each(self._attrs, function(key, value) {
      selection.attr(key, value);
    });
  };
};

Rna2D.canValidate = function(plot) {
  var self = this;

  this.valid = function(fn) {
    var seen = {},
        getID = self.getID(),
        validator = function(o, _) { return o; };

    if (self.hasOwnProperty('validator')) {
      validator = self.validator()();
    }

    return $.map(plot[self._name](), function(value, key) {
      var id = getID(value);
      if (seen[id] || !validator(value, key)) {
        return null;
      }

      var obj = fn(value, key);
      if (obj) {
        seen[id] = true;
      }
      return obj;
    });
  };
}
