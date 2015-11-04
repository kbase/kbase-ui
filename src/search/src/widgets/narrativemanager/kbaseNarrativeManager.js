/**
 * Widget to that routes to the narrative interface, or creates new narratives for you
 *
 * @author Michael Sneddon <mwsneddon@lbl.gov>
 * @public
 */
//TODO create the workspace *after* setting everything up
//TODO handle case when one or more workspaces have had narrative deleted but still have narrative metadata
(function( $, undefined ) {

    $.KBWidget({
        name: "kbaseNarrativeManager", 
        parent: "kbaseAuthenticatedWidget",
        version: "1.0.0",
        
//        dontRedirect: true, //for testing
        dontRedirect: false, //for testing


        /*
          params should have the following fields:

          action: start | new
         */
        options: {
            loadingImage: "assets/img/ajax-loader.gif",
            nms_url: "https://kbase.us/services/narrative_method_store/rpc",
            ws_url: "https://kbase.us/services/ws",
//            ws_url: "https://dev03.berkeley.kbase.us/services/ws",
            params: null
        },

        manager:null,

        ws_name: null,
        nar_name: null,

        $mainPanel: null,
        $newNarrativeLink: null, // when a new narrative is created, gives a place to link to it
        $errorPanel: null,

        init: function(options) {
            this._super(options);

            // must be logged in!
            if (!this.authToken()) {
                var hash = window.location.hash;
                var path;
                if (hash && hash.length > 0) {
                    path = hash.substr(1);
                }
                console.log(encodeURIComponent(path));
                window.location.replace("#/login/?nextPath="+encodeURIComponent(path));
                return this;
            }

            this.$errorPanel = $('<div>');
            this.$elem.append(this.$errorPanel);

            this.$mainPanel = $('<div>').css({'height': '300px'})
                    .append('<img src=' + this.options.loadingImage +
                            '> loading...');
            this.$elem.append(this.$mainPanel);

            this.manager = new NarrativeManager({ws_url: this.options.ws_url,
                nms_url: this.options.nms_url}, this._attributes.auth);

            this.determineActionAndDoIt();

            return this;
        },
        
        showError: function(error) {
            var self = this;
            console.error(error);
            var message;
            if (typeof error == "string") {
                message = error;
            } else {
                message = error.message;
            }
            self.$errorPanel.append($('<div>')
                    .addClass('alert alert-danger alert-dismissible')
                    .attr('role', 'alert')
                    .append(message)
                    .append($('<button>').addClass('close')
                            .attr('type', 'button')
                            .attr('data-dismiss', 'alert')
                            .attr('aria-label', 'Close')
                            .append($('<span>').attr('aria-hidden', 'true')
                                    .append('&times;'))
                    )
            );
        },

        determineActionAndDoIt: function() {
            var self = this;
            if (self.options.params == null) {
                showError({message: "Recieved no parameter info - cannot proceed."});
                return;
            }
            // START - load up last narrative, or start the user's first narrative
            if (self.options.params.action === 'start') {
                self.startOrCreateEmptyNarrative();
            } else if (self.options.params.action === 'new') {
                self.createNewNarrative(self.options.params);
            } else {
                self.showError('action "' + self.options.params.action +
                        '" not supported; only "start" or "new" accepted.');
            }
        },
        
        createNewNarrative: function(params) {
            var self = this;
            if (params.app && params.method) {
                self.showError("Must provide no more than one of the app or method params");
                return;
            }
            var importData = null;
            if (params.copydata) {
                importData = params.copydata.split(';');
            }
            var appData = null;
            if (params.appparam) {
                var tmp = params.appparam.split(';');
                var appData = [];
                for (var i = 0; i < tmp.length; i++) {
                    appData[i] = tmp[i].split(',');
                    if (appData[i].length != 3) {
                        self.showError(
                            "Illegal app parameter set, expected 3 parameters separated by commas: "
                            + tmp[i]);
                        return;
                    }
                    appData[i][0] = parseInt(appData[i][0]);
                    if (isNaN(appData[i][0]) || appData[i][0] < 1) {
                        self.showError(
                                "Illegal app parameter set, first item in set must be an integer > 0: "
                                + tmp[i]);
                        return;
                    }
                }
            }
            var cells = [];
            if (params.app) {
                cells = [{app: params.app}];
            } else if (params.method) {
                cells = [{method: params.method}];
            }
            self.manager.createTempNarrative(
                    {cells:cells, parameters: appData, importData: importData},
                    function(info) {
                        self.redirect(info.nar_info[6], info.nar_info[0]);
                    },
                    function(error) {
                        self.showError(error);
                    }
            );
        },
        
        startOrCreateEmptyNarrative: function() {
            var self = this;
            self.manager.detectStartSettings(
                    function(result) {
                        console.log(result);
                        if (result.last_narrative) {
                            // we have a last_narrative, so go there
                            //console.log('should redirect...');
                            self.redirect(result.last_narrative.ws_info[0],
                                    result.last_narrative.nar_info[0]);
                        } else {
                            //we need to construct a new narrative- we have a first timer
                            self.manager.createTempNarrative(
                                    {cells:[],parameters:[],importData : []},
                                    function(info) {
                                        self.redirect(info.nar_info[6],
                                                info.nar_info[0]);
                                    },
                                    function(error) {
                                        self.showError(error);
                                    }
                            );
                        }
                    },
                    function(error) {
                        self.showError(error);
                    }
            );
        },
        
        redirect: function(workspaceId, objId) {
            var self = this;
            self.$mainPanel.html(
                    'redirecting to <a href="/narrative/ws.' + workspaceId +
                    '.obj.' + objId + '">/narrative/ws.' + workspaceId +
                    '.obj.' + objId + '</a>');
            if (!self.dontRedirect) {
                window.location.replace("/narrative/ws." + workspaceId +
                        ".obj." + objId);
            }
        }
    });

})( jQuery );
