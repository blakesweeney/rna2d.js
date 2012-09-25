var plot2D = function(given) {

  var indexed = {};
  var config = {
    id: '#rna-2d',
    interaction_class: 'interaction',
    nucleotide_class: 'nucleotide',
    width: 960,
    height: 2200,
    font_size: 14
  };

  for(key in given) {
    config[key] = given[key];
  }

  config.nt = '.' + config.nucleotide_class;
  config.int = '.' + config.interaction_class;

  var indexedByPosition = function(data) {
    var indexed = {};
    for(var i = 0; i < data.length; i++) {
      var value = data[i];
      indexed[value['id']] = { 'x': value['x'], 'y': value['y'] }
    }
    return indexed;
  }

  var bbox = function(id) { return document.getElementById(id).getBBox(); };
  var widthOf  = function(id) { return bbox(id).width; };
  var heightOf = function(id) { return bbox(id).height; };

  var rightSide      = function(id) { return indexed[id]['x'] + widthOf(id); };
  var leftSide       = function(id) { return indexed[id]['x']; };
  var verticalCenter = function(id) { return indexed[id]['y'] - heightOf(id)/4; };

  var interactionOf = function(data) { return data['fr3d']['family'] };
  var colorOf = function(color) { 
    if (color) {
      return d3.rgb(color[0], color[1], color[2]);
    };
    return d3.rgb('black');
  }

  var vis = d3.select(config.id)
              .append('svg')
              .attr('width', config.width)
              .attr('height', config.height);

  var plot = { };
  var interactions = {}

  plot.coordinates = function(data) {
    indexed = indexedByPosition(data);

    var make = function(type) {
      return vis.selectAll(config.nt)
        .data(data)
        .enter().append(type)
        .attr('x', function(data) { return data['x'] })
        .attr('y', function(data) { return data['y'] })
        .attr('id', function(data) { return data['id'] })
        .attr('class', config.nucleotide_class);
    };

    make('svg:text')
      .attr('font-size', config.font_size)
      .text(function(data) { return data['sequence'] });

    // vis.selectAll(config.nt)
    //   .append('svg:circle')
    //   .attr('cx', function(data) { return data['x']; })
    //   .attr('cy', function(data) { return data['y']; })
    //   .attr('r', 10);

    return plot;
  };

  plot.filterNucleotides = function(nts) {
  }

  plot.colorNucleotides = function(coloring) {
    var color = function(data) {
      return colorOf(coloring[data['id']]);
    };

    vis.selectAll(config.nt).attr('fill', color);
    return plot;
  }

  plot.interactions = function(pairs) {

    interactions = pairs;

    var interactionClass = function(data) {
      return config.interaction_class + ' ' + interactionOf(data);
    }

    vis.selectAll(config.int)
      .data(pairs)
      .enter().append('svg:line')
      .attr('x1', function(data, i) { return rightSide(data['nt1']) })
      .attr('y1', function(data, i) { return verticalCenter(data['nt1']) })
      .attr('x2', function(data, i) { return leftSide(data['nt2']) })
      .attr('y2', function(data, i) { return verticalCenter(data['nt2']) })
      .attr('id', function(data, i) { return data['nt1'] + ',' + data['nt2'] })
      .attr('stroke', 'black')
      .attr('opacity', 1)
      .attr('class', interactionClass);

      return plot;
  };

  plot.filterInteractions = function(type) {
    var selector = function(data) { return interactionOf(data) == type; };
    if (typeof(type) == 'function') {
      selector = type;
    };

    vis.selectAll(config.int).filter(selector).attr('visibility', 'visibile');

    vis.selectAll(config.int)
      .filter(function(data) { return !selector(data) })
      .attr('visibility', 'hidden');
    return plot;
  };

  plot.colorInteractions = function(coloring) {
    var color = function(data) {
      var interaction = interactionOf(data);
      return colorOf(coloring[interaction]);
    };

    vis.selectAll('.interaction').attr('stroke', color);

    return plot;
  };

  return plot;
};

var plot = plot2D()
            .coordinates(DATA)
            .interactions(PAIRS)
            .filterInteractions('cWW')
            .colorInteractions({cWW: [255, 0, 0]})
            // .colorNucleotides({'1S72_AU_1_A_1_': [255, 0, 0], 
            //                   '1S72_AU_1_A_2_': [0, 255, 0], 
            //                   '1S72_AU_1_A_3_': [0, 0, 255], 
            //                   '1S72_AU_1_A_4_': [0, 0, 0]})
