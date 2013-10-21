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

    var self = this,
        plot = this.plot;

    this.generateHandlers();
    this.coordinates();
    this.connections();
    this.groups();
    this.labels();
    this.update();

  },

  generateHandlers: function() {

    var self = this,
        plot = this.plot;

    plot.nucleotides.highlight(function(d, i) {
      var highlightColor = plot.highlights.color()(d, i);
      self.highlightLetters([d]);
      plot.nucleotides.interactions(d, i).style('stroke', highlightColor);
      return plot.nucleotides;
    });

    plot.nucleotides.normalize(function(d, i) {
      self.clearHighlightLetters();
      plot.nucleotides.interactions(d, i).style('stroke', null);
      return plot.nucleotides;
    });

    plot.interactions.highlight(function(d, i) {
      var highlightColor = plot.interactions.highlightColor()(d, i),
          ntData = [];

      d3.select(this).style('stroke', highlightColor);

      plot.interactions.nucleotides(d, i)
        .datum(function(d, i) { ntData.push(d); return d; });
      self.highlightLetters(ntData);

      return plot.interactions;
    });

    plot.interactions.normalize(function(d, i) {
      d3.select(this).style('stroke', null);
      self.clearHighlightLetters();
      return plot.interactions;
    });

    plot.motifs.highlight(function(d, i) {
      var data = [];
      plot.motifs.nucleotides(d, i)
        .datum(function(d, i) { data.push(d); return d; });
      self.highlightLetters(data, true);
    });

    plot.motifs.normalize(function(d, i) {
      self.clearHighlightLetters();
    });

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
        .attr('visibility', type.visibility())
        .call(type.applyAttrs);
    };
  },

  xDomain: function() { return this.domain.x; },

  yDomain: function() { return this.domain.y; },

  xCoord: function() { return false; },
  yCoord: function() { return false; },
  update: function() { return false; },
  preprocess: function() { return false; },

  chainData: function(s) { return s; },
  coordinateData: function(s) { return s; },
  connectionData: function(s) { return s; },
  groupData: function(s) { return s; },
  labelData: function(s) { return s; },

  coordinateValidor: function(o, i) { return o; },
  interactionValidator: function(o, i) { return o; },
  groupsValidator: function(o, i) { return o; },

  coordinates: function() { 
    var plot = this.plot,
        x = this.xCoord(),
        y = this.yCoord();

    var sele = plot.vis.selectAll(plot.chains['class']())
      .append('g')
      .data(plot.chains()).enter()
        .append('g')
        .call(this.chainData)
        .call(this.drawStandard(plot.chains))
        .selectAll(plot.nucleotides['class']())
        .data(plot.chains.getNTData()).enter();

    return this.coordinateData(sele)
      .call(this.drawStandard(plot.nucleotides))
      .datum(function(d, i) {
        d.__x = x(d, i);
        d.__y = y(d, i);
        return d;
      });
  },

  connections: function() { 
    var plot = this.plot,
        sele = plot.vis.selectAll(plot.interactions['class']())
          .data(plot.interactions.valid(this.interactionValidator)).enter();

    return this.connectionData(sele)
      .call(this.drawStandard(plot.interactions));
  },

  groups: function() {
    var plot = this.plot;
    var sele = plot.vis.selectAll(plot.motifs['class']())
      .data(plot.motifs.valid(this.groupsValidator)).enter();

    this.groupData(sele)
      .attr('missing-nts', function(d) { return d.__missing.join(' '); })
      .call(this.drawStandard(plot.motifs));
  },

  labels: function() { 
    var plot = this.plot,
        sele = plot.vis.selectAll(plot.labels['class']())
          .data(plot.labels()).enter();

    this.labelData(sele)
      .call(this.drawStandard(plot.labels));
  },

  highlightLetters: function(nts, lettersOnly) {
    var plot = this.plot;

    plot.vis.selectAll(plot.highlights['class']())
      .data(nts).enter().append('svg:text')
      .attr('font-size', plot.highlights.size())
      .attr('pointer-events', 'none')
      .text(plot.highlights.text()(lettersOnly))
      .attr('fill', plot.highlights.color())
      .attr('stroke', plot.highlights.color())
      .call(this.highlightLetterData)
      .call(this.drawStandard(plot.highlights));
  },

  clearHighlightLetters: function() {
    this.plot.vis.selectAll('.' + this.plot.highlights['class']()).remove();
    return this;
  }
};

Rna2D.View = View;

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

