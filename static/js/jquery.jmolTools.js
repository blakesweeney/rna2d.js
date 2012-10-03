/*
 *
 *
 *
 */

// Utility
if ( typeof Object.create !== 'function' ) {
	Object.create = function( obj ) {
		function F() {};
		F.prototype = obj;
		return new F();
	};
}

;(function($) {

    // an object for keeping track of the whole system
    $.jmolTools = {
        neighborhood : false,
        stereo: false,
        models : {}, // all model objects, both loaded and not
        numModels: 0 // number of loaded models
    };

    // an object for keeping track of each individual model's state
    var jmolModel = {

        init: function (options, elem) {
			var self = this; // each element
			self.elem = elem;
			self.$elem = $( elem );

            self.modelNumber = null;

            self.loaded       = false;
            self.neighborhood = false;
            self.superimposed = false;
            self.styled       = false;
            self.checked      = false;
            self.hidden       = false;

			self.bindEvents();
        },

        bindEvents: function() {
            var self = this;
            self.$elem.on('click', self.jmolToggle );
        },

        loadData: function() {

            var self = this;
            if ( self.loaded ) { return; }

            $.ajax({
                url: $.fn.jmolTools.options.serverUrl,
                type: 'POST',
                data: {'coord' : self.$elem.data($.fn.jmolTools.options.dataAttribute)}
            }).done(function(data) {
                self.appendData(data);
                if ( self.loaded ) {
                    self.updateModelCounts();
                    self.superimpose();
                    self.styleModel();
                    self.show();
                }
            });
        },

        appendData: function(data) {
            var self = this;
            if ( data.indexOf('MODEL') > -1 ) {
                jmolScriptWait("load DATA \"append structure\"\n" + data + 'end "append structure";');
                self.loaded = true;
            } else {
                console.error('Server returned: ' + data);
            }
        },

        updateModelCounts: function() {
            this.modelNumber = ++$.jmolTools.numModels;
        },

		// superimpose this model onto the first one using phosphate atoms
		superimpose: function() {
		    var self = this;
		    if ( self.superimposed ) { return; }
            var m = self.modelNumber;
            if ( m < 2 ) { return; } // m == 1; nothing to superimpose on

                for (var i = 0; i < 3; i++) {
                // if the same number of phosphates, try to superimpose,
                // otherwise take the first four phosphates
                var command = 'if ({*.P/' + m + '.1}.length == {*.P/1.1}) ' +
                              '{x=compare({*.P/' + m + '.1},{*.P/1.1});}' +
                              'else {x=compare({(*.P/' + m + '.1)[1][4]},{(*.P/1.1)[1][4]});};' +
                              'select ' + m + '.1,' + m + '.2; rotate selected @{x};';
                jmolScript(command);
                }

            self.superimposed = true;
		},

        styleModel: function() {
            if ( this.styled ) { return; }
            var self = this;
            var m = self.modelNumber;
            command = 'select [U]/' + m + '.1; color navy;' +
                      'select [G]/' + m + '.1; color chartreuse;' +
                      'select [C]/' + m + '.1; color gold;' +
                      'select [A]/' + m + '.1; color red;' +
                      'select nucleic and ' + m + '.2; color grey;' +
                      'select protein and ' + m + '.2; color purple;' +
                      'select hetero  and ' + m + '.2; color pink;' +
                      'select ' + m + '.2; color translucent 0.8;' +
                      'select ' + m + '.1,' + m + '.2;' +
                      'spacefill off;' +
                      'center ' + m + '.1;' +
                      'zoom {'  + m + '.1} 0;';
            jmolScript(command);
            self.styled = true;
        },

        show: function() {
            var self = this;
            var m = self.modelNumber;

            if ( $.fn.jmolTools.options.mutuallyExclusive ) {
                self.hideAll();
            }

            if (self.neighborhood) {
                command = 'frame *;display displayed or ' + m + '.1,' + m + '.2; center ' + m + '.1;';
            } else {
                command = 'frame *;display displayed or '      + m + '.1;' +
                          'frame *;display displayed and not ' + m + '.2;' +
                          'center ' + m + '.1;';
            }
            jmolScript(command);
            self.hidden = false;
            self.toggleCheckbox();
        },

		hide: function () {
		    var self = this;
		    m = self.modelNumber;
		    if ( self.loaded ) {
                jmolScript('frame *;display displayed and not ' + m + '.1,' + m + '.2;');
                self.hidden  = true;
                self.toggleCheckbox();
            }
		},

        hideAll: function() {
            jmolScript('hide *');
            $.each($.jmolTools.models, function() {
                this.hidden = true;
                this.toggleCheckbox();
            });
        },

        jmolToggle: function() {
            var self = $.jmolTools.models[this.id];

            if ( ! self.loaded ) {
                self.loadData();
            } else {
                if ( self.hidden ) {
                    self.show();
                } else {
                    self.hide();
                }
            }
        },

        jmolShow: function() {
            var self = $.jmolTools.models[this.id];

            if ( ! self.loaded ) {
                self.loadData();
            } else if ( self.hidden ) {
                self.show();
            }
        },

        jmolHide: function() {
            var self = $.jmolTools.models[this.id];

            if ( ! self.loaded ) {
                self.loadData();
            } else if ( !self.hidden ) {
                self.hide();
            }
        },

		toggleCheckbox: function() {
		    if ( !$.fn.jmolTools.options.toggleCheckbox ) { return; }
            this.$elem.prop('checked', !this.hidden);
		},

		toggleNeighborhood: function() {
		    var self = this;
		    self.neighborhood = !self.neighborhood;
		    if ( !self.hidden && self.loaded ) {
                self.show();
            }
		}

    };

    var Helpers = {

        toggleStereo: function() {
            $.jmolTools.stereo
                ? jmolScript('stereo off;')
                : jmolScript('stereo on;')
            $.jmolTools.stereo = !$.jmolTools.stereo;
        },

        toggleNumbers: function() {
            console.log(this);
            if ( $(this).is(':checked') ) {
                jmolScript('select {*.P},{*.CA};label %[sequence]%[resno];color labels black;');
            } else {
                jmolScript('label off;');
            }
        },

        toggleNeighborhood: function() {
            // update button text
            if ($.jmolTools.neighborhood) {
                this.value = 'Show neighborhood';
            } else {
                this.value = 'Hide neighborhood';
            }
            $.jmolTools.neighborhood = !$.jmolTools.neighborhood;

            $.each($.jmolTools.models, function(ind, model) {
                model.toggleNeighborhood();
            });
        },

        showAll: function() {
            $.each($.jmolTools.models, function(ind, model) {
                if ( ! model.loaded ) {
                    model.loadData();
                } else {
                    model.show();
                }
                model.toggleCheckbox();
            });
        },

        hideAll: function() {
            $.jmolTools.models[$.fn.jmolTools.elems[0].id].hideAll();
        },

        showNext: function() {
            var elems = $($.jmolTools.selector), // can't use cache because the element order can change
                last = elems.length - 1,
                indToCheck = new Array();

            // figure out which ones should be checked
            for (var i = 0; i < elems.length-1; i++) {
                if ( elems[i].checked ) {
                    indToCheck.push(i+1); // the next one should be checked
                    $.jmolTools.models[elems[i].id].jmolToggle.apply(elems[i]); // toggle this model
                }
            }

            // analyze the last one
            if ( elems[last].checked ) {
                $.jmolTools.models[elems[last].id].jmolToggle.apply(elems[last]);
            }

            // uncheck all
            elems.filter(':checked').prop('checked', false);

            // check only the right ones
            $.each(indToCheck, function(ind, id) {
                elems[id].checked = true;
                $.jmolTools.models[elems[id].id].jmolToggle.apply(elems[id]);
            });

            // keep the first one checked if all are unchecked
            if ( elems.filter(':checked').length == 0 ) {
                elems[0].checked = true;
                $.jmolTools.models[elems[0].id].jmolToggle.apply(elems[0]);
            }
        },

        showPrev: function() {
            var elems = $($.jmolTools.selector), // can't use cache because the element order can change
                last = elems.length - 1,
                indToCheck = new Array();

            // loop over all checkboxes except for the first one
            for (var i = elems.length-1; i >= 1; i--) {
                if ( elems[i].checked ) {
                    indToCheck.push(i-1);
                    $.jmolTools.models[elems[i].id].jmolToggle.apply(elems[i]); // toggle this model
                }
            }
            // separate handling of the first checkbox
            if ( elems[0].checked ) {
                indToCheck.push(elems.length-1);
                $.jmolTools.models[elems[0].id].jmolToggle.apply(elems[0]);
            }

            // temporarily uncheck everything
            elems.filter(':checked').prop('checked', false);

            // check only the right ones
            $.each(indToCheck, function(ind, id) {
                elems[indToCheck[i]].checked = true;
                $.jmolTools.models[elems[id].id].jmolToggle.apply(elems[id]);
            });
            // keep the last checkbox checked if all others are unchecked
            if ( elems.filter(':checked').length == 0 ) {
                elems[last].checked = true;
                $.jmolTools.models[elems[last].id].jmolToggle.apply(elems[last]);
            }
        },

        reportLoadingBegan: function() {
            jmolScript('set echo top left; color echo green; echo Loading...;');
        },

        reportLoadingComplete: function() {
            jmolScript('set echo top left; color echo green; echo Done;');
        },

        reportClear: function() {
            jmolScript('set echo top left; echo ;');
        },

        bindEvents: function() {
            $('#' + $.fn.jmolTools.options.showStereoId).on('click', Helpers.toggleStereo);
            $('#' + $.fn.jmolTools.options.showNeighborhoodId).on('click', Helpers.toggleNeighborhood);
            $('#' + $.fn.jmolTools.options.showNumbersId).on('click', Helpers.toggleNumbers);
            $('#' + $.fn.jmolTools.options.showAllId)
                    .toggle(Helpers.showAll, Helpers.hideAll)
                    .toggle(
                function() {
                    $(this).val('Hide all');
                },
                function() {
                    $(this).val('Show all');
                }
            );
            $('#' + $.fn.jmolTools.options.showNextId).on('click', Helpers.showNext);
            $('#' + $.fn.jmolTools.options.showPrevId).on('click', Helpers.showPrev);
            $('#' + $.fn.jmolTools.options.clearId).on('click', Helpers.hideAll);

            $(document).ajaxSend(function() {
                Helpers.reportLoadingBegan();
            });

            $(document).ajaxStop(function() {
                Helpers.reportLoadingComplete();
                setTimeout(Helpers.reportClear, 1200);
            });
        },

        setMutuallyExclusiveProperty: function() {
            if ( $.fn.jmolTools.options.mutuallyExclusive ||
                 $.fn.jmolTools.elems.is('input[type="radio"]') ) {
                $.fn.jmolTools.options.mutuallyExclusive = true;
            }
        }

    }

    // plugin initialization
    $.fn.jmolTools = function ( options ) {

        $.jmolTools.selector = $(this).selector;

        $.fn.jmolTools.options = $.extend( {}, $.fn.jmolTools.options, options );

        // bind events
        Helpers.bindEvents();

        // initialize model state for each element
        $.fn.jmolTools.elems = this.each( function() {
            // create a new object to keep track of state
            var jmdb = Object.create( jmolModel );
            jmdb.init( options, this );
            // store the object
            $.jmolTools.models[this.id] = jmdb;
        });

        // add convenience methods to toggle structures
        $.fn.jmolToggle = function ( options ) {
            return this.each( function() {
                $.jmolTools.models[this.id].jmolToggle.apply(this);
            });
        }
        $.fn.jmolShow = function ( options ) {
            return this.each( function() {
                $.jmolTools.models[this.id].jmolShow.apply(this);
            });
        }
        $.fn.jmolHide = function ( options ) {
            return this.each( function() {
                $.jmolTools.models[this.id].jmolHide.apply(this);
            });
        }

        //
        Helpers.setMutuallyExclusiveProperty();

        // return elements for chaining
        return $.fn.jmolTools.elems;
    }

    // default options
	$.fn.jmolTools.options = {
        serverUrl   : 'http://rna.bgsu.edu/rna3dhub_dev/rest/getCoordinates',
        dataAttribute: 'coord',
        toggleCheckbox: true,      // by default each model will monitor the checked state of its corresponding checkbox
        mutuallyExclusive:  false, // by default will set to false for checkboxes and false for radiobuttons
        showNeighborhoodId: false,
        showNextId:         false,
        showPrevId:         false,
        showAllId:          false,
        showNumbersId:      false,
        showStereoId:       false,
        clearId:            false
	};

})(jQuery);
