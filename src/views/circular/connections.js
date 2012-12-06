Rna2D.views.circular.connections = function(plot) {

  plot.connections = function() {

    var ntIndexes = {},
        getID = plot.nucleotides.getID(),
        raw = plot.nucleotides();

    for(var i = 0; i < raw.length; i++) {
      var current = raw[i];
      ntIndexes[getID(current)] = i;
    }

    var curve = function(d, i) {
      var nt1Index = ntIndexes[d.nt1],
          nt2Index = ntIndexes[d.nt2],
          from = plot.pie.ntCoordinates(d.nt1)
          to = plot.pie.ntCoordinates(d.nt2)
          center = plot.__circleCenter, // TODO: Move center to get better arcs.
          control = { x: center.x - from.x, y: center.y - from.y },
          final = { x: to.x - from.x, y: to.y - from.y };

      return "M " + from.x + " " + from.y + 
             " q " + control.x + " " + control.y + 
             " " + final.x + " " + final.y;
    };

    var interactions = [],
        raw = plot.interactions(),
        seen = {},
        idOf = function(nt1, nt2, family) { return nt1 + ',' + nt2 + ',' + family; };

    for(var i = 0; i < raw.length; i++) {
      var obj = raw[i],
          nt1 = Rna2D.utils.element(obj.nt1),
          nt2 = Rna2D.utils.element(obj.nt2),
          id = idOf(obj.nt1, obj.nt2, obj.family),
          revId = idOf(obj.nt2, obj.nt1, obj.family);

      if (nt1 && nt2) {
        if (!seen[id] && !seen[revId]) {
          var family = obj.family;
          if (family[1] == family[2]) {
            seen[id] = true;
          };

          interactions.push(obj);
        }
      }
    };

    var visible = plot.interactions.visible();

    plot.vis.selectAll(plot.interactions.class())
      .data(interactions).enter().append('path')
      .attr('id', function(d) { return idOf(d.nt1, d.nt2, d.family); })
      .classed(plot.interactions.class(), true)
      .attr('d', curve)
      .attr('fill', 'none')
      .attr('stroke', 'black') //plot.interactions.color())
      .attr('visibility', 'visible') //function(d, i) { return (visible(d) ? 'visible' : 'hidden'); })
      .attr('nt1', function(d, i) { return d.nt1; })
      .attr('nt2', function(d, i) { return d.nt2; })
      .on('click', plot.interactions.click())
      .on('mouseover', function() { console.log(this) })// plot.interactions.mouseover())
      .on('mouseout', plot.interactions.mouseout());
      ;

    return plot;
  };

  return Rna2D;
};

    // var rotation = function(d) {
    //   return plot.__startAngle(null, ntIndexes[d.nt1]);
    // }

    // var radiusOf = function(d) {
    //   var nt1Index = ntIndexes[d.nt1],
    //       nt2Index = ntIndexes[d.nt2];
    //   if (d.nt1 in ntIndexes && d.nt2 in ntIndexes) {
    //     var c1 = plot.pie.angleCoordinate(plot.__startAngle(null, nt1Index)),
    //         c2 = plot.pie.angleCoordinate(plot.__endAngle(null, nt2Index))
    //     return Math.sqrt(Math.pow(c2.x - c1.x, 2) + Math.pow(c2.y - c1.y, 2)) / 2;
    //   }
    //   return null;
    // };

    // var arc = d3.svg.arc()
    //       .outerRadius(radiusOf)
    //       .innerRadius(function(d, i) { return radiusOf(d) + 2; })
    //       .startAngle(0)//function(d, i) { return  plot.__endAngle(null, ntIndexes[d.nt2]); })
    //       .endAngle(Math.PI)//function(d, i) { return  plot.__startAngle(null, ntIndexes[d.nt1]); })
    //       ;

    // var centerOf = function(d) {
    //   var nt1Index = ntIndexes[d.nt1],
    //       nt2Index = ntIndexes[d.nt2];
    //   if (d.nt1 in ntIndexes && d.nt2 in ntIndexes) {
    //     var c1 = plot.pie.angleCoordinate(plot.__startAngle(null, nt1Index)),
    //         c2 = plot.pie.angleCoordinate(plot.__endAngle(null, nt2Index))
    //     return { x: (c2.x + c1.x) / 2, y: (c2.y + c2.y) / 2 };
    //   } else {
    //     console.log(d);
    //   };
    //   return null;
    // };

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
