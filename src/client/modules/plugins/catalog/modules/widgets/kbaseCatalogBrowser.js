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
                self.setupClients();

                // initialize and add the control bar
                var $container = $('<div>').addClass('kbcb-browser-container');
                self.$elem.append($container);
                self.$controlToolbar = this.renderControlToolbar();
                $container.append(this.$controlToolbar);

                // initialize and add the main panel
                self.$loadingPanel = self.initLoadingPanel();
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
                        for(var k=0; k<self.appList.length; k++) {
                            var match = true;
                            for(var t=0; t<terms.length; t++) {
                                if(terms[t].charAt(0)=='"' && terms[t].charAt(terms.length-1)=='"' && terms[t].length>2) {
                                    terms[t] = terms[t].substring(1,terms[t].length-1);
                                    // the regex keeps quotes in quoted strings, so toss those
                                }
                                // filter on names
                                if(self.appList[k].info.name.toLowerCase().indexOf(terms[t]) < 0) {
                                    match = false; break;
                                }
                                // filter on other stuff
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


            skipApp: function(categories) {
                for(var i=0; i<categories.length; i++) {
                    if(categories[i]=='inactive') {
                        return true;
                    }
                    if(categories[i]=='viewers') {
                        return true;
                    }
                    if(categories[i]=='importers') {
                        return true;
                    }
                }
                return false;
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
                            if(self.skipApp(methods[k].categories)) continue;

                            var m = {
                                type: 'method',
                                info: methods[k],
                                $div: $('<div>').addClass('kbcb-app')
                            };
                            self.renderAppBox(m);
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
                        console.log(apps);
                        for(var k=0; k<apps.length; k++) {
                            var a = {
                                type: 'app',
                                info: apps[k],
                                $div: $('<div>').addClass('kbcb-app')
                            };
                            self.renderAppBox(a);
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



            renderAppBox: function(app) {
                //console.log(app)

                // Main Container
                var $appDiv = $('<div>').addClass('kbcb-app-card kbcb-hover');


                // HEADER - contains logo, title, module link, authors
                var $topDiv = $('<div>').addClass('clearfix kbcb-app-card-header');
                var $logoSpan = $('<div>').addClass('col-xs-4 kbcb-app-card-logo');
                // add actual logos here
                $logoSpan.append('<div class="fa-stack fa-3x"><i class="fa fa-square fa-stack-2x method-icon"></i><i class="fa fa-inverse fa-stack-1x fa-cube"></i></div>')
                var $titleSpan = $('<div>').addClass('col-xs-8 kbcb-app-card-title-panel');
                
                $titleSpan.append($('<div>').addClass('kbcb-app-card-title').append(app.info.name));
                if(app.info['module_name']) {
                    $titleSpan.append($('<div>').addClass('kbcb-app-card-module').append(
                                        $('<a href="#appcatalog/module/'+app.info.module_name+'">')
                                            .append(app.info.module_name)
                                            .on('click',function() {
                                                // have to stop propagation so we don't go to the app page first
                                                event.stopPropagation();
                                            })));
                }
                $titleSpan.append($('<div>').addClass('kbcb-app-card-authors').append('by xxx'));

                $appDiv.append(
                    $topDiv
                        .append($logoSpan)
                        .append($titleSpan));


                // SUBTITLE - on mouseover of info, show subtitle information
                var $subtitle = $('<div>').addClass('kbcb-app-card-subtitle').append(app.info.subtitle).hide()
                $appDiv.append($subtitle);


                // FOOTER - stars, number of runs, and info mouseover area
                var $footer = $('<div>').addClass('clearfix kbcb-app-card-footer');


                var $starDiv = $('<div>').addClass('col-xs-3').css('text-align','left');
                var $star = $('<span>').addClass('kbcb-star').append('<i class="fa fa-star"></i>');
                $star.on('click', function() {
                    event.stopPropagation();
                    alert('you have favorited this app - currently does nothing');
                });
                var favoriteCount = Math.floor(Math.random()*100);
                $footer.append($starDiv.append($star).append('&nbsp;'+favoriteCount));
                $starDiv.tooltip({title:'A favorite method of '+favoriteCount+' people.', placement:'bottom',
                                    delay:{show: 400, hide: 40}});


                var nRuns = Math.floor(Math.random()*10000);
                var $nRuns = $('<div>').addClass('col-xs-4').css('text-align','left');
                $nRuns.append($('<span>').append('<i class="fa fa-share"></i>'));
                $nRuns.append('&nbsp;'+nRuns);
                $nRuns.tooltip({title:'Run in a narrative '+nRuns+' times.', placement:'bottom',
                                    delay:{show: 400, hide: 40}});

                $footer.append($nRuns);

                var $moreInfoDiv = $('<div>').addClass('col-xs-5').addClass('kbcb-info').css('text-align','right');
                $moreInfoDiv
                    .on('mouseenter', function() {
                        $topDiv.hide();
                        $subtitle.fadeIn('fast');
                    })
                    .on('mouseleave', function() {
                        $subtitle.hide();
                        $topDiv.fadeIn('fast');
                    });
                $moreInfoDiv.append($('<span>').append('<i class="fa fa-info"></i>'));
                $footer.append($moreInfoDiv);
                $appDiv.append($footer);


                // On click, go to the method page
                $appDiv.on('click', function() {
                    if(app.type === 'method') {
                        window.location.href = "#narrativestore/method/"+app.info.id;
                    } else {
                        window.location.href = "#narrativestore/app/"+app.info.id;
                    }
                });

                // put it all in a container so we can control margins
                var $appCardContainer = $('<div>').addClass('kbcb-app-card-container');
                app.$div = $appCardContainer.append($appDiv);
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



