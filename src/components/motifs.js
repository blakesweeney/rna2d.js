Rna2D.components.motifs = function () {

  var motifs = [];

  return {

    config: {
      classOf: function(d) { return d.id.split("_")[0]; },
      'class': 'motif',
      highlightColor: function() { return 'red'; },
      visible: function(d) { return true; },
      click: null,
      mouseover: null,
      mouseout: null,
      getID: function(d) { return d.id; },
      getNTs: function(d) { return d.nts; },
      highlight: Object,
      normalize: Object
    },

    actions: function(plot) {
      plot.motifs.all = function() {
        return plot.vis.selectAll('.' + config.motif['class']());
      };

      plot.motifs.nucleotides = function(obj) {
        var nts = obj.getAttribute('data-nts').split(',');
        var selector = '#' + nts.join(', #');
        return plot.vis.selectAll(selector);
      };

      plot.motifs.show = function() {
        // return all().attr('visibility', 'visible');
      };

      plot.motifs.hide = function() {
      };

      plot.motifs.toggle = function() {
      };

    }

    //         show: function() {
    //           config.motif.visible = true;
    //           return all().attr('visibility', 'visible');
    //         },

    //         hide: function() {
    //           config.motif.visible = false;
    //           return all().attr('visibility', 'hidden');
    //         },

    //         toggle: function() {
    //           if (config.motif.visible) {
    //             return plot.motifs.hide();
    //           };
    //           return plot.motifs.show();
    //         },

    //plot.motifs.all = function(family) {
      //if (!arguments.length || !family) family = plot.motifs.class();
      //return plot.vis.selectAll('.' + family);
    //};

    //plot.motifs.nucleotides = function(obj) {
      //var nts = obj.getAttribute('data-nts').split(',');
      //var selector = '#' + nts.join(', #');
      //return d3.selectAll(selector);
    //};

    //plot.motifs.show = function(family) {
      //return plot.motifs.all(family)
        //.attr('visibility', function(d) {
          //d.visible = true;
          //return 'visible';
        //});
    //};

    //plot.motifs.hide = function(family) {
      //return plot.motifs.all(family)
        //.attr('visibility', function(d) {
          //d.visible = false;
          //return 'hidden';
        //});
    //};

    //plot.motifs.toggle = function(family) {
      //return plot.motifs.all(family)
        //.attr('visibility', function(d) {
          //d.visible = !d.visible;
          //if (d.visible == false) {
            //return 'hidden';
          //};
          //return 'visible';
        //});
    //};
  };

}();

