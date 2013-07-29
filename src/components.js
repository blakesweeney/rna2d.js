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

  if (!plot.components) {
    Rna2D.components(plot);
  }

  plot.components[this._name] = this;

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
    console.log("Must setup component prior to drawing");
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

Rna2D.setupComponent = function(name, config) {
  function Type() {
    Rna2D.Component.call(this, name, config);
  }

  Type.prototype = new Rna2D.Component(name, config);
  Type.prototype.constructor = Type;

  return Type;
};

Rna2D.components = function(plot) {
  plot.components = function() {
    var name;
    for (name in plot.components) {
      if (plot.components.hasOwnProperty(name)) {
        plot.components[name].generate();
      }
    }
  };
};

//function(plot) {

  //var actions = false;

  //// Create the toplevel component which calls each subcomponent component
  //plot.components = function() {

    //$.each(Rna2D.components, function(name, obj) {

      //if (obj.hasOwnProperty('actions') && !actions) {
        //// If something is toggable we will add all the toggable functions.
        //if (obj.togglable) {
          //Rna2D.togglable(plot, name);
        //}

        //obj.actions(plot);
      //}

    //});

    //actions = true;
  //};

  //// Create each subcomponent with its accessor function, config, side
  //// effects, and rendering function.
  //$.each(Rna2D.components, function(name, obj) {

    //if (plot[name].hasOwnProperty('encodeID') && plot[name].hasOwnProperty('getID')) {
      //plot[name].elementID = function(d, i) {
        //var encode = plot[name].encodeID(),
            //getID = plot[name].getID();
        //return encode(getID(d, i));
      //};
    //}

    //if (plot[name].hasOwnProperty('getNTs')) {
      //(function(prop) {
        //plot[prop].ntElements = function(d, i) {
          //var getNTs = plot[prop].getNTs();
          //return $.map(getNTs(d, i), plot.nucleotides.encodeID());
        //};
      //}(name));
    //}

    //plot.components[name] = obj;
  //});
//};
