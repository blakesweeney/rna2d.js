Rna2D.components.motifs = function(plot) {

  var Motifs = inhert(Rna2D.Component, 'motifs', {
    classOf: function(d) { return [d.id.split("_")[0]]; },
    'class': 'motif',
    highlightColor: function() { return 'red'; },
    click: Object,
    mouseover: null,
    mouseout: null,
    getID: function(d) { return d.id; },
    encodeID: function(id) { return id; },
    getNTs: function(d) { return d.nts; },
    highlight: Object,
    normalize: Object,
    plotIfIncomplete: true
  });

  var motifs = new Motifs();

  motifs.boundingBoxes = function(given) {
    return $.map(given, function(current, i) {
      var left = Number.MIN_VALUE,
          right = Number.MAX_VALUE,
          top = Number.MAX_VALUE,
          bottom = Number.MIN_VALUE;

      current.missing = [];

      // Find the outer points.
      var nts = plot.motifs.ntElements()(current);
      $.each(nts, function(j, id) {
        var elem = Rna2D.utils.element(id);

        if (elem === null) {
          console.log('Missing nt ' + id + ' in motif: ', current);
          current.missing.push(id);
        } else {
          var bbox = elem.getBBox();
          if (bbox.x < right) {
            right = bbox.x;
          }
          if (bbox.x + bbox.width > left) {
            left = bbox.x + bbox.width;
          }
          if (bbox.y + bbox.height > bottom) {
            bottom = bbox.y + bbox.height;
          }
          if (bbox.y < top) {
            top = bbox.y;
          }
        }
      });

      // Store bounding box. It is very odd to get a bounding box that
      // involves the max number value. In this case we think that we have not
      // actually found the nts so we log this and use a box that cannot be
      // seen. This prevents bugs where we stop drawing boxes too early.
      if (bottom === Number.MIN_VALUE || left === Number.MIN_VALUE || 
          right === Number.MAX_VALUE || top === Number.MAX_VALUE) {
        console.log("Unlikely bounding box found for " + current.id);
        return null;
      }

      if (current.missing && !motifs.plotIfIncomplete()) {
        return null;
      }

      current.bounding = [
        { x: left, y: top },
        { x: left, y: bottom },
        { x: right, y: bottom },
        { x: right, y: top }
      ];

      return current;
    });
  };

  Rna2D.withIdElement.call(motifs);
  Rna2D.withNTElements.call(motifs, plot);
  Rna2D.asToggable.call(motifs, plot);

  motifs.visible('IL', 'HL', 'J3');
  motifs.attach(plot);

  return motifs;
};
