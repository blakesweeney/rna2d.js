'use strict';

var extend = require('extend'),
    utils = require('./utils.js');

exports.hasData = function(given, callback) {
  utils.accessor(this, 'data', given, callback);
};

exports.withIdElement = function() {
  var self = this;
  this.elementID = function() {
    var getID = self.getID(),
        encodeID = self.encodeID();
    return function(d, i) {
      return encodeID(getID(d, i));
    };
  };
};

exports.withNTElements = function() {
  var self = this;

  this.ntElements = function() {
    var getNTs = self.getNTs(),
        encodeID = self.plot.nucleotides.encodeID();
    return function(d, i) { return getNTs(d, i).map(encodeID); };
  };

  this.nucleotides = function(d, i) {
    var nts = self.getNTs()(d, i),
        idOf = self.plot.nucleotides.getID();
    return self.plot.vis.selectAll('.' + self.plot.nucleotides['class']())
      .filter(function(d, i) { return nts.indexOf(idOf(d, i)) !== -1; });
  };
};

exports.withInteractions = function() {
  var self = this;

  this.interactions = function(d, i) {
    var id = self.getID()(d, i),
        getNTs = self.plot.interactions.getNTs();
    return self.plot.vis.selectAll('.' + self.plot.interactions['class']())
      .filter(function(d) { return getNTs(d).indexOf(id) !== -1; });
  };
};

exports.asToggable = function() {
  var type = this;

  type.all = function(klass) {
    klass = (klass && klass !== 'all' ? klass : type['class']());
    return type.plot.vis.selectAll('.' + klass);
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

exports.asColorable = function() {
  var self = this,

  colorByNT = function(mapping, options) {
    var getID = this.getID();
    return function(d, i) {
      return (mapping[getID(d, i)] ? options.match : options.mismatch);
    };
  };

  this.colorize = function() {
    return self.all().attr('fill', self.color());
  };

  this.colorExcept = function(mapping, given) {
    var standard = { match: 'black', mismatch: 'red' },
        options = extend({}, standard, given || {});
    return colorByNT(mapping, options);
  };

  this.colorOnly = function(mapping, given) {
    var standard = { match: 'red', mismatch: 'black' },
        options = extend({}, standard, given || {});
    return colorByNT(mapping, options);
  };

  this.colorByAttribute = function(attribute, fn) {
    var func = fn || function(v) { return v; };
    return function(d) { return func(d[attribute]); };
  };
};

exports.withAttrs = function(defaults) {
  var self = this;

  this._attrs = defaults || {};
  this.attr = function(key, value) {
    self._attrs[key] = value;
    return self;
  };

  this.applyAttrs = function(selection) {
    Object.keys(self._attrs).forEach(function (key) {
      selection.attr(key, self._attrs[key]);
    });
  };
};

exports.canValidate = function() {
  var self = this;

  this.valid = function(fn) {
    var seen = {},
        getID = self.getID(),
        validator = function(o) { return o; };

    if (self.hasOwnProperty('validator')) {
      validator = self.validator()();
    }

    return self.data().map(function(value, key) {
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
};
