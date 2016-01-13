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
            name: "KBaseCatalogModuleViewer",
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

            // main panel and elements
            $mainPanel: null,
            $loadingPanel: null,

            init: function (options) {
                this._super(options);
                
                var self = this;

                self.module_name = options.module_name;

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
                loadingCalls.push(self.getModuleInfo());
                loadingCalls.push(self.getModuleVersions());

                // when we have it all, then render the list
                Promise.all(loadingCalls).then(function() {
                    self.render();
                    self.hideLoading();
                });


                return this;
            },

            render: function() {
                var self = this;

                var info = self.moduleDetails.info;
                var versions = self.moduleDetails.versions;

                var $header = $('<div>');

                $header.append($('<h1>').append(info.module_name));
                $header.append($('<h4>').append(
                    '<a href="'+info.git_url+'" target="_blank">'+info.git_url+'<a>'));
                $header.append($('<div>').html(info.description));

                var $owners = $('<div>').append('<i>KBase Module Developed by:</i> ');
                for(var k=0; k<info.owners.length; k++) {
                    // todo: get nice name
                    var username = info.owners[k];
                    $owners.append('<a href="#people/'+username+'">'+username+"</a> ");

                }
                $header.append($owners);

                self.$mainPanel.append($header);
                self.$mainPanel.append('<hr>');



                var $versionDiv = $('<div>');

                $versionDiv.append('<h3>Stable Released Version</h3>');
                if(info.release) {
                    $versionDiv.append(self.renderVersion('release',info.release));
                } else {
                    $versionDiv.append('<i>This module has not been released.</i>');
                }

                $versionDiv.append('<h3>Beta Version</h3>');
                if(info.beta) {
                    $versionDiv.append(self.renderVersion('beta',info.beta));
                } else {
                    $versionDiv.append('<i>This module has not been released to beta.</i>');
                }

                $versionDiv.append('<h3>Development Version</h3>');
                if(info.dev) {
                    $versionDiv.append(self.renderVersion('dev',info.dev));
                } else {
                    $versionDiv.append('<i>This module has not been registered properly.</i>');
                }

                self.$mainPanel.append($versionDiv);
                

                console.debug(self.moduleDetails);



            },

            // tag=dev/beta/release/version number, version=the actual info
            renderVersion: function(tag, version) {
                var $verDiv = $('<div>');

                $verDiv.append('<b>Version:</b>' + version.version + '<br>');
                $verDiv.append('<b>Timestamp:</b>' + version.timestamp+'<br>');
                $verDiv.append('<b>Commit:</b>' + version.git_commit_hash+'<br>');
                $verDiv.append('<b>Commit Mssg:</b>' + version.git_commit_message+'<br>');
                $verDiv.append('<b>Narrative Methods:</b><br>');

                for(var i=0; i<version.narrative_methods.length; i++) {
                    var id = version.narrative_methods[i];
                    $verDiv.append(' - <a href="#appcatalog/app/method/'+self.module_name+'/'+id+
                        '">'+id+'</a><br>');
                }

                return $verDiv;
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




            getModuleInfo: function() {
                var self = this

                var moduleSelection = {
                    module_name: self.module_name
                };

                return self.catalog.get_module_info(moduleSelection)
                    .then(function (info) {
                        console.log(info);
                        /*typedef structure {
                            string module_name;
                            string git_url;

                            string description;
                            string language;

                            list <string> owners;

                            ModuleVersionInfo release;
                            ModuleVersionInfo beta;
                            ModuleVersionInfo dev;
                        } ModuleInfo;*/
                        self.moduleDetails.info = info;
                    })
                    .catch(function (err) {
                        console.error('ERROR');
                        console.error(err);
                    });
            },


            getModuleVersions: function() {
                var self = this

                var moduleSelection = {
                    module_name: self.module_name
                };

                return self.catalog.list_released_module_versions(moduleSelection)
                    .then(function (versions) {
                        console.log(versions);
                        /*typedef structure {
                            string module_name;
                            string git_url;

                            string description;
                            string language;

                            list <string> owners;

                            ModuleVersionInfo release;
                            ModuleVersionInfo beta;
                            ModuleVersionInfo dev;
                        } ModuleInfo;*/
                        self.moduleDetails.versions = versions;
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



