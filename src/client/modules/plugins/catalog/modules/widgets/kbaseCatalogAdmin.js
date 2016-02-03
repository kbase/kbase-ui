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
            name: "KBaseCatalogAdmin",
            parent: "kbaseAuthenticatedWidget",  // todo: do we still need th
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
            $pendingReleaseDiv: null,
            $devListDiv: null,


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
                self.$pendingReleaseDiv = mainPanelElements[2];
                self.$devListDiv = mainPanelElements[3];
                self.$elem.append(self.$mainPanel);
                self.showLoading();

                var modules = [];
                if(self.options.module_names) {
                    modules = self.options.module_names.split(';');
                }

                // get the module information
                var loadingCalls = [];
                loadingCalls.push(self.getDevList());
                loadingCalls.push(self.getCatalogVersion());
                loadingCalls.push(self.getModuleList());
                loadingCalls.push(self.getPendingReleases());

                // when we have it all, then render the list
                Promise.all(loadingCalls).then(function() {
                    self.render();
                    self.hideLoading();
                });

                return this;
            },

            render: function() {
                var self = this;
                self.renderBasicStatus();
                self.renderPendingRelease();
                self.renderDevList();
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
                var $mainPanel = $('<div>').addClass('container');

                $mainPanel.append($('<h3>').append('Catalog Admin Console:'));

                var $basicStatusDiv = $('<div>');
                $mainPanel.append($basicStatusDiv);

                $mainPanel.append($('<h4>').append('Modules Pending Release:'));
                var $pendingReleaseDiv = $('<div>');
                $mainPanel.append($pendingReleaseDiv);


                $mainPanel.append($('<h4>').append('Approved Developers:'));
                var $approvedDevelopers = $('<div>');
                $mainPanel.append($approvedDevelopers);


                $mainPanel.append('<br><br>');

                return [$mainPanel, $basicStatusDiv, $pendingReleaseDiv, $approvedDevelopers];
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


            renderBasicStatus: function() {
                var self = this;

                self.$basicStatusDiv.append('<a href="#appcatalog/status">Catalog Status Page</a><br><br>');
                self.$basicStatusDiv.append('Running <b>v'+self.catalog_version+'</b> of the Catalog Server on: ');
                self.$basicStatusDiv.append('<a href="'+self.runtime.getConfig('services.catalog.url')+'">'+self.runtime.getConfig('services.catalog.url')+'</a>');
                self.$basicStatusDiv.append('<br>');
                self.$basicStatusDiv.append('<b>'+self.module_list.length+'</b> modules registered.');
                self.$basicStatusDiv.append('<br><br>');

            },


            rerenderPendingRelease: function() {
                var self = this;
                self.$pendingReleaseDiv.empty();

                self.getPendingReleases()
                    .then(function() {
                        self.renderPendingRelease();
                    });
            },

            renderPendingRelease: function() {
                var self = this;

                self.$pendingReleaseDiv.append(
                    $('<button>').addClass('btn btn-default').css('margin','12px')
                            .append($('<i>').addClass('fa fa-refresh').append(' Refresh'))
                            .on('click', function() { self.rerenderPendingRelease(); })
                    );

                if(self.requested_releases.length>0) {
                    var $ul = $('<ul>');
                    for(var k=0; k<self.requested_releases.length; k++) {

                        var addRow = function (mod) {

                            var $li = $('<li>');
                            $li.append('<a href="#appcatalog/module/'+mod.module_name+'">'+mod.module_name+'</a>');
                            $li.append('- <a href="'+mod.git_url+'">'+mod.git_url+'</a><br>');
                            $li.append(mod.git_commit_hash + ' - '+mod.git_commit_message+'<br>');
                            $li.append('owners: [')
                            for(var owner=0; owner<mod.owners.length; owner++) {
                                if(owner>0) { $ul.append(', ') }
                                $li.append('<a href="#people/'+mod.owners[owner]+'">'+mod.owners[owner]+'</a>');
                            }
                            $li.append(']<br>');
                            $li.append('Registered on: '+new Date(mod.timestamp).toLocaleString()+'<br>');

                            var $resultDiv = $('<div>');
                            var $approveBtn = $('<button>').addClass('btn btn-default').append('Approve Release').css('margin','4px');
                            var $denyBtn = $('<button>').addClass('btn btn-default').append('Deny Release').css('margin','4px');

                            $approveBtn.on('click', function() {
                                $approveBtn.prop('disabled', true);
                                $denyBtn.prop('disabled', true);
                                var $confirm = $('<button>').addClass('btn btn-danger').append('Confirm');
                                var $confirmDiv = $('<div>').append($confirm);
                                $confirm.on('click', function(){
                                    $confirmDiv.remove();
                                    console.log('approving '+mod.module_name);
                                    self.catalog.review_release_request({
                                            module_name:mod.module_name, 
                                            decision:'approved'
                                        })
                                        .then(function () {
                                            $resultDiv.prepend($('<div role=alert>').addClass('alert alert-success')
                                                .append('<b>Success</b>- Release request has been approved.'));
                                        })
                                        .catch(function (err) {
                                            console.error("Could not deny release.");
                                            console.error(err);
                                            $resultDiv.prepend($('<div role=alert>').addClass('alert alert-danger')
                                                .append('<b>Error:</b> '+err.error.message));
                                        });

                                });
                                $resultDiv.prepend($confirmDiv);
                            });

                            $denyBtn.on('click', function() {
                                $approveBtn.prop('disabled', true);
                                $denyBtn.prop('disabled', true);
                                var $reasonInput = $('<input type="text" size="100">').addClass('form-control').css('margin','4px');
                                var $submit = $('<button>').addClass('btn btn-danger').append('Confirm');
                                var $reason = $('<div>')
                                    .append('Why no go? ')
                                    .append($reasonInput)
                                    .append($submit);
                                $submit.on('click', function() {
                                    $reason.remove();
                                    console.log('denying '+mod.module_name);

                                    self.catalog.review_release_request({
                                            module_name:mod.module_name, 
                                            decision:'denied',
                                            review_message:$reasonInput.val()
                                        })
                                        .then(function () {
                                            $resultDiv.prepend($('<div role=alert>').addClass('alert alert-success')
                                                .append('<b>Success</b>- Release request has been declined.'));
                                        })
                                        .catch(function (err) {
                                            console.error("Could not deny release.");
                                            console.error(err);
                                            $resultDiv.prepend($('<div role=alert>').addClass('alert alert-danger')
                                                .append('<b>Error:</b> '+err.error.message));
                                        });

                                });
                                $resultDiv.prepend($reason);
                            });

                            $li.append($approveBtn);
                            $li.append($denyBtn);
                            $li.append($resultDiv);
                            $li.append('<br>');

                            $ul.append($li);
                        };
                        addRow(self.requested_releases[k]);
                    }
                    self.$pendingReleaseDiv.append('<br>');
                    self.$pendingReleaseDiv.append($ul);
                } else {
                    self.$pendingReleaseDiv.append(' <i>None.</i><br>');
                }
                //self.$pendingReleaseDiv.append('<br>');
            },


            refreshDevList: function() {
                var self = this;
                self.$devListDiv.empty();
                self.getDevList()
                    .then(function() {
                        self.renderDevList();
                    });
            },


            renderDevList: function() {
                var self = this;

                var $addDev = $('<div>').css('margin','1em');
                var $devList = $('<div>').css('margin','1em');

                self.$devListDiv.append($addDev);
                self.$devListDiv.append($devList);


                var $devName = $('<input type="text" size="50">').addClass('form-control').css('margin','4px');
                var $add = $('<button>').addClass('btn btn-default').append($('<i>').addClass('fa fa-plus'));
                var $trash = $('<button>').addClass('btn btn-default').append($('<i>').addClass('fa fa-trash'));
                var $result = $('<div>');


                $addDev.append($('<b>').append('Add/Remove Developer:')).append('<br>')
                $addDev.append(
                    $('<div>').addClass('input-group').css('width','35%')
                        .append($devName)
                        .append($('<span>').addClass('input-group-btn')
                            .append($add)
                            .append($trash)))
                    .append($result);
                $add.on('click', function() {
                    self.catalog.approve_developer($devName.val())
                        .then(function () {
                            self.refreshDevList();
                        })
                        .catch(function (err) {
                            console.error('ERROR');
                            console.error(err);
                            $result.prepend($('<div role=alert>').addClass('alert alert-danger')
                                .append('<b>Error:</b> '+err.error.message));
                        });
                });
                $trash.on('click', function() {
                    self.catalog.revoke_developer($devName.val())
                        .then(function () {
                            self.refreshDevList();
                        })
                        .catch(function (err) {
                            console.error('ERROR');
                            console.error(err);
                            $result.prepend($('<div role=alert>').addClass('alert alert-danger')
                                .append('<b>Error:</b> '+err.error.message));
                        });
                });

                $devList.append('<i> '+self.dev_list.length+' Approved Developers</i><br>');
                for(var k=0; k<self.dev_list.length; k++) {
                    $devList.append(
                        $('<div>').append(
                            $('<a href="#people/'+self.dev_list[k]+'">').append(self.dev_list[k])));
                }
            },


            getCatalogVersion: function() {
                var self = this

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

            getPendingReleases: function() {
                var self = this

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


            getDevList: function() {
                var self = this
                self.dev_list = [];
                return self.catalog.list_approved_developers()
                    .then(function (devs) {
                        self.dev_list = devs;
                    })
                    .catch(function (err) {
                        console.error('ERROR');
                        console.error(err);
                    });
            },

            getModuleList: function() {
                var self = this

                return self.catalog.list_basic_module_info({
                        include_unreleased:1
                    })
                    .then(function (module_list) {
                        var good_modules = []
                        for(var k=0; k<module_list.length; k++) {
                            if(module_list[k].module_name) {
                                good_modules.push(module_list[k]);
                            }
                        }
                        good_modules.sort(function(a, b) {
                            if(a.module_name.toLowerCase() < b.module_name.toLowerCase()){
                                return -1;
                            } else if(a.module_name.toLowerCase() > b.module_name.toLowerCase()){
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
            }
        });
    });



