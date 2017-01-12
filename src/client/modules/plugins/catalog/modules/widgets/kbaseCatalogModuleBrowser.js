/*global
 define
 */
/*jslint
 browser: true,
 white: true
 */
define([
    'jquery',
    'bluebird',
    'kb/service/client/catalog',
    '../catalog_util',
    'datatables',
    'kb_widget/legacy/authenticatedWidget',
    'bootstrap'
],
    function ($, Promise, Catalog, CatalogUtil) {
        $.KBWidget({
            name: "KBaseCatalogModuleBrowser",
            parent: "kbaseAuthenticatedWidget",  // todo: do we still need th
            options: {
            },

            // clients to the catalog service and the NarrativeMethodStore
            catalog: null,
            util: null,

            // main panel and elements
            $mainPanel: null,
            $loadingPanel: null,

            moduleList:null,

            init: function (options) {
                this._super(options);
                
                var self = this;

                // new style we have a runtime object that gives us everything in the options
                self.runtime = options.runtime;
                self.util = new CatalogUtil();
                self.setupClients();

                // initialize and add the main panel
                self.$loadingPanel = self.util.initLoadingPanel();
                self.$elem.append(self.$loadingPanel);
                var mainPanelElements = self.initMainPanel();
                self.$mainPanel = mainPanelElements[0];
                self.$moduleListPanel = mainPanelElements[1];
                self.$elem.append(self.$mainPanel);
                self.showLoading();

                var loadingCalls = [];
                loadingCalls.push(self.populateModuleList());

                // when we have it all, then render the list
                Promise.all(loadingCalls).then(function() {
                    self.render();
                    self.hideLoading();
                });

                return this;
            },

            render: function() {
                var self = this;


                if(self.myModuleList.length > 0) {

                    self.$moduleListPanel.append( $('<div>').append($('<h4>').append('My Modules')) );
                    var $myModuleTable = self.renderTable(self.myModuleList);
                    self.$moduleListPanel.append($myModuleTable);
                    self.$moduleListPanel.append( $('<div>').css('height','30px') );
                    self.$moduleListPanel.append( $('<div>').append($('<h4>').append('All Modules')) );
                }

                var $moduleTable = self.renderTable(self.moduleList);
                self.$moduleListPanel.append($moduleTable);
                self.$moduleListPanel.append( $('<div>').css('height','100px') );




            },

            renderTable: function(moduleData) {
                var $table = $('<table>').addClass('table').css('width','100%');

                var $container = $('<div>').addClass('container')
                        .append($('<div>').addClass('row')
                            .append($('<div>').addClass('col-md-12')
                                .append($table)));

                var limit = 10000; var sDom = 'tipf';
                if(moduleData.length<limit) {
                    sDom = 'ift';
                }

                var tblSettings = {
                    "bFilter": true,
                    "sPaginationType": "full_numbers",
                    "iDisplayLength": limit,
                    "sDom": sDom,
                    "aaSorting": [[ 3, "dsc" ],[ 4, "dsc" ], [ 0, "asc" ]],
                    "columns": [
                        {sTitle: 'Module Name', data: "module_name_link"},
                        {sTitle: "Owners", data: "owners_link"},
                        {sTitle: "Language", data: "language"},
                        {sTitle: "Released?", data: "is_released"},
                        {sTitle: "Beta?", data: "has_beta"},
                        {sTitle: "Service?", data: "is_service"},
                        {sTitle: "Git URL", data: "git_url_link"}
                    ],
                    "data": moduleData
                };
                $table.DataTable(tblSettings);
                $table.find('th').css('cursor','pointer');

                return $container;
            },


            setupClients: function() {
                this.catalog = new Catalog(
                    this.runtime.getConfig('services.catalog.url'),
                    { token: this.runtime.service('session').getAuthToken() }
                );
            },

            initMainPanel: function() {
                var $mainPanel = $('<div>').addClass('container');

                $mainPanel.append($('<div>').addClass('kbcb-back-link')
                        .append($('<a href="#catalog">').append('<i class="fa fa-chevron-left"></i> back to the Catalog Index')));

                var $moduleListPanel =  $('<div>');
                $mainPanel.append($moduleListPanel);

                return [$mainPanel, $moduleListPanel];
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
                        self.moduleList = [];
                        self.myModuleList = [];
                        for(var k=0; k<modules.length; k++) {
                            var moduleData = modules[k];

                            moduleData['is_released'] = '';
                            if(moduleData['release'] && moduleData['release']['git_commit_hash']) {
                                moduleData['is_released'] = 'Yes (' + moduleData['release_version_list'].length + ')';
                            }

                            moduleData['has_beta'] = '';
                            if(moduleData['beta'] && moduleData['beta']['git_commit_hash']) {
                                moduleData['has_beta'] = 'Yes';
                            }

                            moduleData['is_service'] = '';
                            if(moduleData['dynamic_service'] && moduleData['dynamic_service']==1) {
                                moduleData['is_service'] = 'Yes';
                            }

                            moduleData['module_name_link'] = '<a href="#catalog/modules/'+ moduleData['module_name'] +'">' + moduleData['module_name'] + '</a>';
                            moduleData['git_url_link'] = '<a href="'+ moduleData['git_url'] +'" target="_blank">' + moduleData['git_url'] + '</a>';
                            moduleData['owners_link'] = '';
                            var isMyModule = false;
                            var me = self.runtime.service('session').getUsername();
                            for(var o=0; o<moduleData['owners'].length; o++) {
                                if(moduleData['owners'][o] === me) {
                                    isMyModule = true;
                                }
                                if(o>=1) { moduleData['owners_link'] += ', '; }
                                moduleData['owners_link'] += '<a href="#people/'+ moduleData['owners'][o] +'">' + moduleData['owners'][o] + '</a>';
                            }
                            self.moduleList.push(moduleData);
                            if(isMyModule) {
                                self.myModuleList.push(moduleData);
                            }
                        }
                        console.log(self.moduleList)
                    })
                    .catch(function (err) {
                        console.error('ERROR');
                        console.error(err);
                    });
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
            }
        });
    });



