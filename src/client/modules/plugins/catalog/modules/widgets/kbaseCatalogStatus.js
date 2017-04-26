define([
    'bluebird',
    'jquery',
    'kb_service/client/narrativeMethodStore',
    'kb_service/client/catalog',
    '../catalog_util',
    'kb_widget/legacy/authenticatedWidget',
    'bootstrap'
], function (Promise, $, NarrativeMethodStore, Catalog, CatalogUtil) {
    'use strict';
    $.KBWidget({
        name: 'KBaseCatalogStatus',
        parent: 'kbaseAuthenticatedWidget', // todo: do we still need th
        options: {
            module_names: null,
            limit: 20,
            skip: 0
        },

        // clients to the catalog service and the NarrativeMethodStore
        catalog: null,
        nms: null,
        util: null,

        // main panel and elements
        $mainPanel: null,
        $loadingPanel: null,
        $basicStatusDiv: null,
        $controlToolbarPanel: null,
        $buildListPanel: null,


        build_list: null,
        module_list: null,
        catalog_version: null,
        requested_releases: null,

        init: function (options) {
            this._super(options);

            var self = this;

            // new style we have a runtime object that gives us everything in the options
            self.runtime = options.runtime;
            self.setupClients();
            self.util = new CatalogUtil();

            // initialize and add the main panel
            self.$loadingPanel = self.initLoadingPanel();
            self.$elem.append(self.$loadingPanel);
            var mainPanelElements = self.initMainPanel();
            self.$mainPanel = mainPanelElements[0];
            self.$basicStatusDiv = mainPanelElements[1];
            self.$controlToolbarPanel = mainPanelElements[2];
            self.$buildListPanel = mainPanelElements[3];
            self.$elem.append(self.$mainPanel);
            self.showLoading();

            var modules = [];
            if (self.options.module_names) {
                modules = self.options.module_names.split(';');
            }

            // get the module information
            var loadingCalls = [];
            loadingCalls.push(self.getBuildStatus(self.options.skip, self.options.limit, modules));
            loadingCalls.push(self.getCatalogVersion());
            loadingCalls.push(self.getModuleList());
            loadingCalls.push(self.getPendingReleases());

            // when we have it all, then render the list
            Promise.all(loadingCalls).then(function () {
                self.render();
                self.hideLoading();
            }).catch(function (err) {
                self.hideLoading();
                console.error('ERROR contacting the catalog');
                console.error(err);
                self.renderError();
            });

            return this;
        },

        renderError: function () {
            var self = this
            self.$basicStatusDiv.empty()
            self.$basicStatusDiv.append(
                $('<div role=alert>').addClass('alert alert-danger')
                .append('<b>Error contacting the catalog.  The catalog may be down.</b>'))
        },

        render: function () {
            var self = this;
            self.renderBasicStatus();
            self.renderControlPanel();
            self.renderBuildList();
        },

        setupClients: function () {
            this.catalog = new Catalog(
                this.runtime.getConfig('services.catalog.url'), { token: this.runtime.service('session').getAuthToken() }
            );
            this.nms = new NarrativeMethodStore(
                this.runtime.getConfig('services.narrative_method_store.url'), { token: this.runtime.service('session').getAuthToken() }
            );
        },

        initMainPanel: function ($appListPanel, $moduleListPanel) {
            var $mainPanel = $('<div>').addClass('container');

            $mainPanel.append($('<div>').addClass('kbcb-back-link')
                .append($('<a href="#catalog/apps">').append('<i class="fa fa-chevron-left"></i> back to the Catalog')));

            $mainPanel.append($('<h3>').append('Catalog Status:'));
            var $basicStatusDiv = $('<div>');
            $mainPanel.append($basicStatusDiv);

            $mainPanel.append($('<h3>').append('Recent Module Registrations:'));
            //$mainPanel.append('<br>');
            var $controlToolbarPanel = $('<div>').addClass('row kbcb-ctr-toolbar');
            $mainPanel.append($controlToolbarPanel);
            //$mainPanel.append('<br>');
            var $buildListPanel = $('<div>');
            $mainPanel.append($buildListPanel);
            return [$mainPanel, $basicStatusDiv, $controlToolbarPanel, $buildListPanel];
        },

        initLoadingPanel: function () {
            var $loadingPanel = $('<div>').addClass('kbcb-loading-panel-div');
            $loadingPanel.append($('<i>').addClass('fa fa-spinner fa-2x fa-spin'));
            return $loadingPanel;
        },

        showLoading: function () {
            var self = this;
            self.$loadingPanel.show();
            self.$mainPanel.hide();
        },
        hideLoading: function () {
            var self = this;
            self.$loadingPanel.hide();
            self.$mainPanel.show();
        },


        renderBasicStatus: function () {
            var self = this;
            self.$basicStatusDiv.append('Running <b>v' + self.catalog_version + '</b> of the Catalog Server on: ');
            self.$basicStatusDiv.append('<a href="' + self.runtime.getConfig('services.catalog.url') + '">' + self.runtime.getConfig('services.catalog.url') + '</a>');
            self.$basicStatusDiv.append('<br>');
            self.$basicStatusDiv.append('<b>' + self.module_list.length + '</b> modules registered.');
            self.$basicStatusDiv.append('<br>');
            self.$basicStatusDiv.append('<b>Modules Pending Release:</b>');
            if (self.requested_releases.length > 0) {
                var $ul = $('<ul>');
                for (var k = 0; k < self.requested_releases.length; k++) {
                    var mod = self.requested_releases[k];
                    var $li = $('<li>');
                    $li.append('<a href="#catalog/modules/' + mod.module_name + '">' + mod.module_name + '</a>');
                    $li.append('- <a href="' + mod.git_url + '">' + mod.git_url + '</a><br>');
                    $li.append(mod.git_commit_hash + ' - ' + mod.git_commit_message + '<br>');
                    $li.append('owners: [');
                    for (var owner = 0; owner < mod.owners.length; owner++) {
                        if (owner > 0) {
                            $li.append(', ');
                        }
                        $li.append('<a href="#people/' + mod.owners[owner] + '">' + mod.owners[owner] + '</a>');
                    }
                    $li.append(']<br>');
                    $li.append('Registered on: ' + new Date(mod.timestamp).toLocaleString() + '<br>');
                    $ul.append($li);
                }
                self.$basicStatusDiv.append('<br>');
                self.$basicStatusDiv.append($ul);
            } else {
                self.$basicStatusDiv.append(' <i>None.</i><br>');
            }
        },

        renderControlPanel: function () {
            var self = this;

            var $filterModules = $('<select>').addClass('form-control');
            $filterModules.append('<option value="All.Modules">All Modules</option>');
            for (var k = 0; k < self.module_list.length; k++) {
                var m = self.module_list[k].module_name;
                $filterModules.append('<option value="' + m.toLowerCase() + '">' + m + '</option>');
            }
            if (self.options.module_names) {
                var names = self.options.module_names.split(';');
                if (names.length > 0) {
                    $filterModules.val(names[0].toLowerCase());
                }
            }

            var $setLimit = $('<select>').addClass('form-control');
            $setLimit.append('<option value="20">20</option>');
            $setLimit.append('<option value="50">50</option>');
            $setLimit.append('<option value="100">100</option>');
            $setLimit.append('<option value="500">500</option>');
            $setLimit.append('<option value="500">1000</option>');
            $setLimit.val(self.options.limit);

            $filterModules.on('change', function () {
                var modules = [];
                if ($filterModules.val() !== 'All.Modules') {
                    modules = [$filterModules.val()];
                }
                self.getBuildStatus(
                        self.options.skip,
                        $setLimit.val(),
                        modules)
                    .then(
                        function () { self.renderBuildList(); }
                    );
            });
            var $filterModulesDiv =
                $('<div>').addClass('form-group')
                .append($('<label for="filter_modules">').append('Filter by Module'))
                .append($filterModules);



            $setLimit.on('change', function () {
                var modules = [];
                if ($filterModules.val() !== 'All.Modules') {
                    modules = [$filterModules.val()];
                }
                self.getBuildStatus(
                        self.options.skip,
                        $setLimit.val(),
                        modules)
                    .then(
                        function () { self.renderBuildList(); }
                    );
            });

            var $setLimitDiv =
                $('<div>').addClass('form-group')
                .append($('<label for="filter_modules">').append('Showing:'))
                .append($setLimit);


            var $refreshBtn = $('<button>').addClass('btn btn-default')
                .append('<i class="fa fa-refresh fa-lg">');
            $refreshBtn.on('click', function () {
                var modules = [];
                if ($filterModules.val() !== 'All.Modules') {
                    modules = [$filterModules.val()];
                }
                self.getBuildStatus(
                    self.options.skip,
                    $setLimit.val(),
                    modules).then(
                    function () {
                        self.renderBuildList();
                    }
                );
            });

            self.$controlToolbarPanel
                .append($('<div>').addClass('col-md-6').append($filterModulesDiv))
                .append($('<div>').addClass('col-md-2').append($setLimitDiv))
                .append($('<div>').addClass('col-md-2').append($refreshBtn));

        },



        renderBuildList: function () {
            var self = this;
            self.$buildListPanel.empty();

            self.$buildListPanel
                .append('<i>last refreshed: ' + new Date().toLocaleString() + '</i>')
                .append('<br><br>');

            for (var k = 0; k < self.build_list.length; k++) {
                self.$buildListPanel.append(
                    self.renderBuildInfo(self.build_list[k]));
            }

        },


        renderBuildInfo: function (info) {
            var self = this;
            /*typedef structure {
                string registration_id;
                string registration;
                string error_message;
                string module_name_lc;
                string git_url;
            } BuildInfo;*/
            var $row = $('<div role="alert">').addClass('alert');
            if (info.registration === 'error') {
                $row.addClass('alert-danger');
            } else if (info.registration === 'complete') {
                $row.addClass('alert-success');
            } else {
                $row.addClass('alert-warning');
            }

            // timestamp is part of the registration_id
            var timestamp = self.util.getTimeStampStr(info.timestamp);

            if (info.module_name_lc) {
                $row.append('<strong><a href="#catalog/modules/' + info.module_name_lc + '">' + info.module_name_lc + '</a></strong> - ');
            } else {
                $row.append('<strong>Module Name Not Detected</strong> - ');
            }
            $row.append('<a href="' + info.git_url + '">' + info.git_url + '</a>');
            $row.append($('<span>').addClass('pull-right').css('color', '#777')
                .append(timestamp)
                .append('<br>')
                .append('<a href="#catalog/register/' + info.registration_id + '">' + info.registration_id + '</a>'));
            $row.append('<br>');
            $row.append('Status: ' + info.registration);
            if (info.error_message) {
                $row.append(' - ' + info.error_message);
            }
            return $row;
        },


        getCatalogVersion: function () {
            var self = this;

            var moduleSelection = {
                module_name: self.module_name
            };

            return self.catalog.version()
                .then(function (version) {
                    self.catalog_version = version;
                })
                .catch(function (err) {
                    console.error('ERROR');
                    console.error(err);
                });
        },

        getPendingReleases: function () {
            var self = this;

            /* typedef structure {
                string module_name;
                string git_url;
                string git_commit_hash;
                string git_commit_message;
                int timestamp;
                list <string> owners;
            } RequestedReleaseInfo; */
            return self.catalog.list_requested_releases()
                .then(function (requested_releases) {
                    self.requested_releases = requested_releases;
                })
                .catch(function (err) {
                    console.error('ERROR');
                    console.error(err);
                });
        },


        getBuildStatus: function (skip, limit, module_names) {
            var self = this;

            var build_filter = {
                skip: skip,
                limit: limit
            };
            if (module_names) {
                if (module_names.length > 0) {
                    build_filter['modules'] = [];
                    for (var k = 0; k < module_names.length; k++) {
                        build_filter.modules.push({
                            module_name: module_names[k]
                        });
                    }
                }
            }

            self.build_list = null;

            return self.catalog.list_builds(build_filter)
                .then(function (builds) {
                    self.build_list = builds;
                })
                .catch(function (err) {
                    console.error('ERROR');
                    console.error(err);
                });
        },

        getModuleList: function () {
            var self = this;

            return self.catalog.list_basic_module_info({
                    include_unreleased: 1
                })
                .then(function (module_list) {
                    var good_modules = [];
                    for (var k = 0; k < module_list.length; k++) {
                        if (module_list[k].module_name) {
                            good_modules.push(module_list[k]);
                        }
                    }
                    good_modules.sort(function (a, b) {
                        if (a.module_name.toLowerCase() < b.module_name.toLowerCase()) {
                            return -1;
                        } else if (a.module_name.toLowerCase() > b.module_name.toLowerCase()) {
                            return 1;
                        }
                        return 0;
                    });

                    self.module_list = good_modules;
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