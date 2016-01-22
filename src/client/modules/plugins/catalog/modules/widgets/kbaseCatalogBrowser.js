/*global
 define
 */
/*jslint
 browser: true,
 white: true
 */
define([
    'jquery',
    'kb/service/client/narrativeMethodStore',
    'kb/service/client/catalog',
    './catalog_util',
    'kb/widget/legacy/authenticatedWidget',
    'bootstrap',
],
    function ($, NarrativeMethodStore, Catalog, CatalogUtil) {
        $.KBWidget({
            name: "KBaseCatalogBrowser",
            parent: "kbaseAuthenticatedWidget",  // todo: do we still need th
            options: {

            },
            $mainPanel: null,
            $errorPanel: null,

            // clients to the catalog service and the NarrativeMethodStore
            catalog: null,
            nms: null,

            // list of NMS method and app info (todo: we need to move this to the catalog)
            // for now, most of the filtering/sorting etc is done on the front end; this
            // will eventually need to move to backend servers when there are enough methods
            appList: null,

            // list of catalog module info
            moduleList: null,

            // dict of module info for fast lookup
            moduleLookup: null,

            // control panel and elements
            $controlToolbar: null,


            // main panel and elements
            $mainPanel: null,
            $appListPanel: null,
            $moduleListPanel: null,
            $loadingPanel: null,


            init: function (options) {
                this._super(options);
                
                var self = this;

                // new style we have a runtime object that gives us everything in the options
                self.runtime = options.runtime;
                console.log(options);
                console.log(this.runtime.service('session').getAuthToken());
                self.util = new CatalogUtil();
                self.setupClients();

                // initialize and add the control bar
                var $container = $('<div>').addClass('kbcb-browser-container');
                self.$elem.append($container);
                self.$controlToolbar = this.renderControlToolbar();
                $container.append(this.$controlToolbar);

                // initialize and add the main panel
                self.$loadingPanel = self.util.initLoadingPanel();
                self.$elem.append(self.$loadingPanel);
                var mainPanelElements = self.initMainPanel();
                self.$mainPanel = mainPanelElements[0];
                self.$appListPanel = mainPanelElements[1];
                self.$moduleListPanel = mainPanelElements[2];
                $container.append(self.$mainPanel);
                self.showLoading();

                // get the list of apps and modules
                var loadingCalls = [];
                self.appList = []; self.moduleList = [];
                loadingCalls.push(self.populateAppListWithMethods());
                loadingCalls.push(self.populateAppListWithApps());
                loadingCalls.push(self.populateModuleList());

                // when we have it all, then render the list
                Promise.all(loadingCalls).then(function() {
                    console.log('done loading!');

                    // do a quick sort here first
                    self.appList.sort(function(a,b) {
                        // first make sure methods show up first
                        if(a.type<b.type) return 1;
                        if(b.type<a.type) return -1;

                        if(a.info.module_name && !b.info.module_name) return -1;
                        if(!a.info.module_name && b.info.module_name) return 1;
                        
                        if(a.info.name<b.info.name) 1;
                        if(b.info.name>b.info.name) -1;


                        return 0;
                    });

                    self.processData();

                    self.renderAppList();
                    self.hideLoading();
                });

                return this;
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



            renderControlToolbar: function () {
                var self = this;

                var $searchDiv = $('<div>').addClass('col-md-4');

                var $searchBox = $('<input type="text" placeholder="Search" size="50">').addClass('form-control');
                $searchBox.on('input',
                    function() {
                        self.filterApps($searchBox.val());
                    });

                $searchDiv.append($('<div>').addClass('input-group input-group-sm')
                                        .append($searchBox));

                // sort
                // toggle module vs app/method
                // toggle release, dev, beta versions

                var $ctrbar = $('<div>').addClass('row kbcb-ctr-toolbar');
                $ctrbar.append($searchDiv);


                var $linksDiv = $('<div>').addClass('col-md-6');
                $linksDiv.append('<a href="#appcatalog/status">status</a> | ');
                $linksDiv.append('<a href="#appcatalog/register">register new app</a>');
                $ctrbar.append($linksDiv);

                return $ctrbar;
            },


            filterApps: function(query) {
                var self = this;
                query = query.trim();
                if(query) {
                    var terms = query.toLowerCase().match(/\w+|"(?:\\"|[^"])+"/g);
                    if (terms) {
                        //console.log(terms);
                        console.log(self.appList[0].info);
                        for(var k=0; k<self.appList.length; k++) {
                            var match = false; // every term must match
                            for(var t=0; t<terms.length; t++) {
                                if(terms[t].charAt(0)=='"' && terms[t].charAt(terms.length-1)=='"' && terms[t].length>2) {
                                    terms[t] = terms[t].substring(1,terms[t].length-1);
                                    // the regex keeps quotes in quoted strings, so toss those
                                }
                                // filter on names
                                if(self.appList[k].info.name.toLowerCase().indexOf(terms[t]) >= 0) {
                                    match = true; continue;
                                }
                                // filter on module names, if they exist
                                if(self.appList[k].info.module_name) {
                                    if(self.appList[k].info.module_name.toLowerCase().indexOf(terms[t]) >= 0) {
                                        match = true; continue;
                                    }
                                }
                                // filter on other description
                                if(self.appList[k].info.subtitle) {
                                    if(self.appList[k].info.subtitle.toLowerCase().indexOf(terms[t]) >= 0) {
                                        match = true; continue;
                                    }
                                }

                                // filter on authors
                                if(self.appList[k].info.authors) {
                                    for(var a=0; a<self.appList[k].info.authors.length; a++) {
                                        if(self.appList[k].info.authors[a].toLowerCase().indexOf(terms[t]) >= 0) {
                                            match = true; break;
                                        }
                                    }
                                    if(match) { continue; }
                                }

                                // filter on other stuff

                                // if we get here, term didnt' match anything, so we can break
                                match = false; break;
                            }


                            // show or hide
                            if(match) {
                                self.appList[k].$div.show();
                            } else {
                                self.appList[k].$div.hide();
                            }
                        }
                    } else {
                        self.clearFilter();
                    }

                } else {
                    self.clearFilter();
                }
            },

            clearFilter: function() {
                var self = this;
                for(var k=0; k<self.appList.length; k++) {
                    self.appList[k].$div.show();
                }
            },



            initMainPanel: function($appListPanel, $moduleListPanel) {
                var $mainPanel = $('<div>').addClass('kbcb-main-panel-div');
                var $appListPanel = $('<div>');
                var $moduleListPanel = $('<div>');
                $mainPanel.append($appListPanel);
                $mainPanel.append($moduleListPanel);
                $mainPanel.append('<br><br>')
                return [$mainPanel, $appListPanel, $moduleListPanel];
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

            populateAppListWithMethods: function() {
                var self = this;

                // determine which set of methods to fetch
                var tag='dev';

                return self.nms.list_methods({
                        tag:tag
                    })
                    .then(function (methods) {
                        for(var k=0; k<methods.length; k++) {

                            // logic to hide/show certain categories
                            if(self.util.skipApp(methods[k].categories)) continue;

                            var m = {
                                type: 'method',
                                info: methods[k],
                                $div: $('<div>').addClass('kbcb-app')
                            };
                            self.util.renderAppCard(m);
                            self.appList.push(m);
                        }
                    })
                    .catch(function (err) {
                        console.error('ERROR');
                        console.error(err);
                    });
            },

            populateAppListWithApps: function() {
                var self = this;

                // determine which set of methods to fetch
                var tag='release';

                return self.nms.list_apps({
                        tag:tag
                    })
                    .then(function (apps) {
                        //console.log(apps);
                        for(var k=0; k<apps.length; k++) {
                            var a = {
                                type: 'app',
                                info: apps[k],
                                $div: $('<div>').addClass('kbcb-app')
                            };
                            self.util.renderAppCard(a);
                            self.appList.push(a);
                        }
                    })
                    .catch(function (err) {
                        console.error('ERROR');
                        console.error(err);
                    });
            },



            populateModuleList: function() {
                var self = this

                var moduleSelection = {
                    include_released:1,
                    include_unreleased:1,
                    include_disabled:0
                };

                return self.catalog.list_basic_module_info(moduleSelection)
                    .then(function (modules) {
                        //return self.catalog.list_basic_module_info()
                        //console.log('hello modules');
                        //console.log(modules);
                        for(var k=0; k<modules.length; k++) {
                            var m = {
                                info: modules[k],
                                $div: $('<div>').addClass('kbcb-module')
                            };
                            self.renderModuleBox(m);
                            self.moduleList.push(m);
                        }
                    })
                    .catch(function (err) {
                        console.error('ERROR');
                        console.error(err);
                    });
            },

            processData: function() {
                var self = this;

                // setup module map
                self.moduleLookup = {};
                for(var m=0; m<self.moduleList.length; m++) {
                    self.moduleLookup[self.moduleList[m].info.module_name] = self.moduleList.info;
                }
            },




            renderModuleBox: function(module) {
                var $modDiv = $('<div>').addClass('kbcb-app');
                $modDiv.append(module.info.module_name);
                module.$div = $modDiv;
            },



            renderAppList: function() {
                var self = this;

                self.$appListPanel.append('<i>Note: temporarily showing dev versions</i><br>')

                for(var k=0; k<self.appList.length; k++) {
                    self.$appListPanel.append(self.appList[k].$div);
                }

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



