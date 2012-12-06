Rna2D.views.circular.connections = function(plot) {

  plot.connections = function() {

    var ntIndexes = {},
        getID = plot.nucleotides.getID(),
        raw = plot.nucleotides();

    for(var i = 0; i < raw.length; i++) {
      var current = raw[i];
      ntIndexes[getID(current)] = i;
    }

    var radiusOf = function(d) {
      var nt1Index = ntIndexes[d.nt1],
          nt2Index = ntIndexes[d.nt2];

      if (d.nt1 in ntIndexes && d.nt2 in ntIndexes) {
        var c1 = arcPoint(plot.__startAngle(null, nt1Index)),
            c2 = arcPoint(plot.__endAngle(null, nt2Index))

        return Math.sqrt(Math.pow(c2.x - c1.x, 2) + Math.pow(c2.y - c1.y, 2)) / 2;
      }
      return null;
    };

    var arcPoint = function(angle) {
      var c = plot.__circleCenter
          x = plot.__innerRadius * Math.cos(angle * 360 / (2 * Math.PI)),
          y = plot.__innerRadius * Math.sin(angle * 360 / (2 * Math.PI));
      return { x: c.x + x, y: c.y + y };
    };

    var centerOf = function(d) {
      var nt1Index = ntIndexes[d.nt1],
          nt2Index = ntIndexes[d.nt2];

      if (d.nt1 in ntIndexes && d.nt2 in ntIndexes) {
        var c1 = arcPoint(plot.__startAngle(null, nt1Index)),
            c2 = arcPoint(plot.__endAngle(null, nt2Index))

        return { x: (c2.x + c1.x) / 2, y: (c2.y + c2.y) / 2 };
      } else {
        console.log(d);
      };

      return null;
    };

    var rotation = function(d) {
      return plot.__startAngle(null, ntIndexes[d.nt1]);
    }

    var arc = d3.svg.arc()
          .outerRadius(radiusOf)
          .innerRadius(function(d, i) { return radiusOf(d) + 2; })
          .startAngle(0)//function(d, i) { return  plot.__endAngle(null, ntIndexes[d.nt2]); })
          .endAngle(Math.PI)//function(d, i) { return  plot.__startAngle(null, ntIndexes[d.nt1]); })
          ;

    var data = plot.interactions().slice(1, 100),
        visible = plot.interactions.visible()
        ;

    plot.vis.selectAll(plot.interactions.class())
      .data(data).enter().append('path')
      .attr('d', arc)
      .attr('visibility', function(d, i) { return (visible(d) ? 'visible' : 'hidden'); })
      .attr('transform', function(d) {
        var center = centerOf(d);
        if (center)  {
          return 'translate(' + center.x + ',' + center.y + ')'
        };
        return null;
      })

    return plot;
  };

  return Rna2D;
};

    // var orderedNts = {},
    //   raw = plot.nucleotides(),
    //   getID = plot.nucleotides.getID(),
    //   data = []
    //   ;


    // data = data.slice(1, 100);
    // console.log(data);

    // // var chord = d3.svg.chord()
    // //   .radius(function(d, i) { return plot.__radius; })
    // //   .source(function(d, i) { return d.source; })
    // //   .target(function(d, i) { return d.target; })
    // //   .startAngle(function(d, i) { return d.startAngle; })
    // //   .endAngle(function(d, i) { return d.endAngle; })
    // //   ;

    // var arc = d3.svg.arc()
    //       .outerRadius(outer)
    //       .innerRadius(inner)
    //       .startAngle(startAngle)
    //       .endAngle(endAngle);

    // console.log(chord(data[0]));

    // plot.vis.selectAll(plot.interactions.class())
    //   .append('g')
    //   .data(data).enter().append('svg:path')
    //   .classed(plot.interactions.class(), true)
    //   .attr('d', chord)
    //   ;

    // for(var i = 0; i < raw.length; i++) {
    //   var current = raw[i];
    //   orderedNts[getID(current)] = { index: i };
    // }

    // raw = plot.interactions();
    // for(var i = 0; i < raw.length; i++) {
    //   var current = raw[i],
    //       nt1 = orderedNts[current.nt1],
    //       nt2 = orderedNts[current.nt2] ;

    //   if (nt1 && nt2) {
    //     var d = {
    //       source: {
    //         nt: current.nt1,
    //         startAngle: plot.__startAngle(null, nt1.index),
    //         endAngle:
    //       },
    //       target: {
    //         nt: current.nt2,
    //         startAngle:
    //         endAngle: plot.__endAngle(null, nt2.index)
    //       }

    //     };
    //     data.push(d);
    //   } else {
    //     // Handling missing nts
    //   }
    // }

    // var ntGetter = function(interaction, nt) {
    //   var cur = interaction[nt];
    //   return orderedNts[cur];
    // };
