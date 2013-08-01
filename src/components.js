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
  this._status = {};
  var status = this._status,
      type = this;

  type.all = function(klass) {
    klass = (klass && klass !== 'all' ? klass : type['class']());
    return plot.vis.selectAll('.' + klass);
  };

  type.visible = function() {
    $.each(arguments, function(i, klass) { status[klass] = true; });
  };

  type.hidden = function() {
    $.each(arguments, function(i, klass) { status[klass] = null;  });
  };

  type.show = function(klass) {
    status[klass] = true;
    return type.all(klass).attr('visibility', function() { return 'visible'; });
  };

  type.hide = function(klass) {
    status[klass] = null;
    return type.all(klass).attr('visibility', function() { return 'hidden'; });
  };

  type.toggle = function(klass) {
    return (status[klass] ? type.hide(klass) : type.show(klass));
  };

  // Note that we use null above so here we can use the fact that jQuery's map
  // is actually a map/filter to remove elements as we traverse.
  type.visibility = function(d, i) {
    var klasses = type.classOf()(d),
        found = $.map(klasses, function(k, i) { return status[k]; });
    return (found.length ? 'visible' : 'hidden');
  };
};

Rna2D.asColorable = function() {
  var self = this;
  this.colorize = function() {
    return self.all().attr('fill', self.color());
  };
};

