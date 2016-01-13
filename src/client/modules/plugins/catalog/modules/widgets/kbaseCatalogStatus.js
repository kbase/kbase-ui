/*global
 define
 */
/*jslint
 browser: true,
 white: true
 */
define([
    'jquery',
    'kb/service/client/NarrativeMethodStore',
    'kb/service/client/Catalog',
    'kb/widget/legacy/authenticatedWidget',
    'bootstrap',
],
    function ($, NarrativeMethodStore, Catalog) {
        $.KBWidget({
            name: "KBaseCatalogStatus",
            parent: "kbaseAuthenticatedWidget",  // todo: do we still need th
            options: {
                module_name:'null'
            },
            $mainPanel: null,
            $errorPanel: null,


            // clients to the catalog service and the NarrativeMethodStore
            catalog: null,
            nms: null,

            // 
            module_name: null,
            moduleDetails: null,
            isGithub: null,

            // main panel and elements
            $mainPanel: null,
            $loadingPanel: null,

            init: function (options) {
                this._super(options);
                
                var self = this;

                self.module_name = options.module_name;
                self.isGithub = false;

                // new style we have a runtime object that gives us everything in the options
                self.runtime = options.runtime;
                self.setupClients();

                console.log(options);

                // initialize and add the main panel
                self.$loadingPanel = self.initLoadingPanel();
                self.$elem.append(self.$loadingPanel);
                var mainPanelElements = self.initMainPanel();
                self.$mainPanel = mainPanelElements[0];
                self.$elem.append(self.$mainPanel);
                self.showLoading();


                // get the module information
                var loadingCalls = [];
                self.moduleDetails = { info:null, versions:null };
                loadingCalls.push(self.getBuildStatus());
                loadingCalls.push(self.getCatalogVersion());

                // when we have it all, then render the list
                Promise.all(loadingCalls).then(function() {
                    self.render();
                    self.hideLoading();
                });


                return this;
            },

            render: function() {
                var self = this;
            },


            setupClients: function() {
                this.catalog = new Catalog(
                    this.runtime.getConfig('services.catalog.url'),
                    { token: this.runtime.service('session').getAuthToken() }
                );
                this.nms = new NarrativeMethodStore(
                    this.runtime.getConfig('services.narrative_method_store.url'),
                    { token: this.runtime.service('session').getAuthToken() }
                );
            },






            initMainPanel: function($appListPanel, $moduleListPanel) {
                var $mainPanel = $('<div>').addClass('kbcb-mod-main-panel');
                return [$mainPanel];
            },

            initLoadingPanel: function() {
                var $loadingPanel = $('<div>').addClass('kbcb-loading-panel-div');
                $loadingPanel.append($('<i>').addClass('fa fa-spinner fa-2x fa-spin'));
                return $loadingPanel;
            },

            showLoading: function() {
                var self = this;
                self.$loadingPanel.show();
                self.$mainPanel.hide();
            },
            hideLoading: function() {
                var self = this;
                self.$loadingPanel.hide();
                self.$mainPanel.show();
            },




            getBuildStatus: function(skip, limit, module_names) {
                var self = this

                var build_filter = {
                    skip: skip,
                    limit: limit
                };
                if(module_names) {
                    build_filter['modules']=module_names;
                }


                return self.catalog.list_builds(build_filter)
                    .then(function (builds) {
                        console.log(builds);
                        /*typedef structure {
                            string registration_id;
                            string registration;
                            string error_message;
                            string module_name_lc;
                            string git_url;
                        } BuildInfo;*/

                    })
                    .catch(function (err) {
                        console.error('ERROR');
                        console.error(err);
                    });
            },


            getCatalogVersion: function() {
                var self = this

                var moduleSelection = {
                    module_name: self.module_name
                };

                return self.catalog.version()
                    .then(function (version) {
                        console.log('version:'+version);
                    })
                    .catch(function (err) {
                        console.error('ERROR');
                        console.error(err);
                    });
            },


            showError: function (error) {
                this.$errorPanel.empty();
                this.$errorPanel.append('<strong>Error when fetching App/Method information.</strong><br><br>');
                this.$errorPanel.append(error.error.message);
                this.$errorPanel.append('<br>');
                this.$errorPanel.show();
            }
        });
    });



