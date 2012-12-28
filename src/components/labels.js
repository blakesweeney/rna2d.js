Rna2D.components.labels = {
  config: {
    majorTickClass: 'major-tick',
    minorTickClass: 'minor-tick',
    labelClass: 'label',
    width: 5,
    fontSize: 12,
    majorTickCount: 30,
    majorTickGenerator: function(length) {
      var scale = d3.scale.identity()
        .domain([1, plot.nucleotides().length + 1])
        .range([1, plot.nucleotides().length + 1]);
      return scale.ticks(plot.labels.majorTickCount());
    },
    minorTickCount: 150,
    minorTickGenerator: function(length) {
      var scale = d3.scale.identity()
        .domain([1, plot.nucleotides().length + 1])
        .range([1, plot.nucleotides().length + 1]);
      return scale.ticks(plot.labels.minorTickCount());
    }
  }
};

