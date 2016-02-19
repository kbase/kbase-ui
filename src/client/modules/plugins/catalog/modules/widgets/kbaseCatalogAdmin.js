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
                self.$moduleList = mainPanelElements[4];
                self.$clientGroupList = mainPanelElements[5];
                self.$elem.append(self.$mainPanel);
                self.showLoading();

                // get the module information
                var loadingCalls = [];
                loadingCalls.push(self.getDevList());
                loadingCalls.push(self.getCatalogVersion());
                loadingCalls.push(self.getModuleList());
                loadingCalls.push(self.getReleasedModuleList());
                loadingCalls.push(self.getUnreleasedModuleList());

                loadingCalls.push(self.getPendingReleases());

                loadingCalls.push(self.getClientGroups());

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
                self.renderModuleList();
                self.renderClientGroupList();
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

                $mainPanel.append($('<div>').addClass('kbcb-back-link')
                        .append($('<a href="#appcatalog">').append('<i class="fa fa-chevron-left"></i> back to the Catalog')));
                
                $mainPanel.append($('<h3>').append('Catalog Admin Console:'));

                var $basicStatusDiv = $('<div>');
                $mainPanel.append($basicStatusDiv);

                $mainPanel.append($('<h4>').append('Modules Pending Release:'));
                var $pendingReleaseDiv = $('<div>');
                $mainPanel.append($pendingReleaseDiv);


                $mainPanel.append($('<h4>').append('Approved Developers:'));
                var $approvedDevelopers = $('<div>');
                $mainPanel.append($approvedDevelopers);
                $mainPanel.append('<br>');

                $mainPanel.append($('<h4>').append('Module List:'));
                var $moduleList = $('<div>');
                $mainPanel.append($moduleList);
                $mainPanel.append('<br>');

                $mainPanel.append($('<h4>').append('Client Groups:'));
                var $clientGroups = $('<div>');
                $mainPanel.append($clientGroups);
                $mainPanel.append('<br>');



                $mainPanel.append('<br><br>');

                return [$mainPanel, $basicStatusDiv, $pendingReleaseDiv, $approvedDevelopers, $moduleList, $clientGroups];
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


            renderModuleList: function() {
                var self = this;


                var $activateModule = $('<div>').css('margin','1em');
                self.$moduleList.append($activateModule);
                var $deleteModule = $('<div>').css('margin','1em');
                self.$moduleList.append($deleteModule);
                var $modList = $('<div>').css('margin','1em');
                self.$moduleList.append($modList);


                // Module Activation / Deactivation
                var $modNameAct = $('<input type="text" size="50">').addClass('form-control').css('margin','4px');
                var $activate = $('<button>').addClass('btn btn-default').append($('<i>').addClass('fa fa-thumbs-o-up')).tooltip({title:'activate'});
                var $deactivate = $('<button>').addClass('btn btn-default').append($('<i>').addClass('fa fa-thumbs-o-down')).tooltip({title:'deactivate'});
                var $actResult = $('<div>');

                $activateModule.append($('<b>').append('Activate / Deactivate Module:')).append('<br>')
                $activateModule.append(
                    $('<div>').addClass('input-group').css('width','35%')
                        .append($modNameAct)
                        .append($('<span>').addClass('input-group-btn')
                            .append($activate).append($deactivate)))
                    .append($actResult);
                $activate.on('click', function() {
                    var modName = $modNameAct.val();
                    $modNameAct.val('');
                    $actResult.empty();
                    self.catalog.set_to_active({module_name:modName})
                        .then(function () {
                            $actResult.prepend($('<div role=alert>').addClass('alert alert-success')
                                .append('<b>Success.</b> The module '+modName+' was set to Active. Refresh this page to update the list.'));
                        })
                        .catch(function (err) {
                            console.error('ERROR');
                            console.error(err);
                            $actResult.prepend($('<div role=alert>').addClass('alert alert-danger')
                                .append('<b>Error:</b> '+err.error.message));
                        });
                });
                $deactivate.on('click', function() {
                    var modName = $modNameAct.val();
                    $modNameAct.val('');
                    $actResult.empty();
                    self.catalog.set_to_inactive({module_name:modName})
                        .then(function () {
                            $actResult.prepend($('<div role=alert>').addClass('alert alert-success')
                                .append('<b>Success.</b> The module '+modName+' was set to Inactive. Refresh this page to update the list.'));
                        })
                        .catch(function (err) {
                            console.error('ERROR');
                            console.error(err);
                            $actResult.prepend($('<div role=alert>').addClass('alert alert-danger')
                                .append('<b>Error:</b> '+err.error.message));
                        });
                });



                // Module Deletion
                var $modNameDel = $('<input type="text" size="50">').addClass('form-control').css('margin','4px');
                var $trash = $('<button>').addClass('btn btn-default').append($('<i>').addClass('fa fa-trash'));
                var $result = $('<div>');

                $deleteModule.append($('<b>').append('Delete Module:')).append(' (only allowed if not yet released):').append('<br>')
                $deleteModule.append(
                    $('<div>').addClass('input-group').css('width','35%')
                        .append($modNameDel)
                        .append($('<span>').addClass('input-group-btn')
                            .append($trash)))
                    .append($result);
                $trash.on('click', function() {
                    $result.empty();

                    var modName = $modNameDel.val();
                    $modNameDel.val('');
                    var $confirm = $('<button>').addClass('btn btn-danger').append('Confirm deletion of '+modName+'?' );
                    $result.append($confirm);
                    var $cancel = $('<button>').addClass('btn btn-default').append('Nevermind.' );
                    $result.append($cancel);
                    $cancel.on('click',function() {
                        $result.empty();
                    });


                    $confirm.on('click', function() {
                        $confirm.hide();
                        self.catalog.delete_module({module_name:modName})
                            .then(function () {
                                $result.prepend($('<div role=alert>').addClass('alert alert-success')
                                    .append('<b>Success.</b> The module '+modName+' was deleted. Refresh this page to update the list.'));
                            })
                            .catch(function (err) {
                                console.error('ERROR');
                                console.error(err);
                                $result.prepend($('<div role=alert>').addClass('alert alert-danger')
                                    .append('<b>Error:</b> '+err.error.message));
                            });
                    });
                });

                $modList.append('<i> '+self.released_modules.length+' Released Modules</i><br>');
                $tbl = $('<table>').addClass('table table-hover table-condensed');
                for(var k=0; k<self.released_modules.length; k++) {
                    $tbl.append(
                        $('<tr>')
                            .append($('<td>')
                                .append($('<a href="#appcatalog/module/'+self.released_modules[k].module_name+'">').append(self.released_modules[k].module_name)))
                            .append($('<td>')
                                .append($('<a href="'+self.released_modules[k].git_url+'">').append(self.released_modules[k].git_url))));
                }
                $modList.append($tbl);

                $modList.append('<i> '+self.unreleased_modules.length+' Unreleased Modules</i><br>');
                $tbl = $('<table>').addClass('table table-hover table-condensed');
                for(var k=0; k<self.unreleased_modules.length; k++) {
                    $tbl.append(
                        $('<tr>')
                            .append($('<td>')
                                .append($('<a href="#appcatalog/module/'+self.unreleased_modules[k].module_name+'">').append(self.unreleased_modules[k].module_name)))
                            .append($('<td>')
                                .append($('<a href="'+self.unreleased_modules[k].git_url+'">').append(self.unreleased_modules[k].git_url))));
                }
                $modList.append($tbl);

                $modList.append('<i> '+self.inactive_modules.length+' Inactive Modules</i><br>');
                $tbl = $('<table>').addClass('table table-hover table-condensed');
                for(var k=0; k<self.inactive_modules.length; k++) {
                    $tbl.append(
                        $('<tr>')
                            .append($('<td>')
                                .append($('<a href="#appcatalog/module/'+self.inactive_modules[k].module_name+'">').append(self.inactive_modules[k].module_name)))
                            .append($('<td>')
                                .append($('<a href="'+self.inactive_modules[k].git_url+'">').append(self.inactive_modules[k].git_url))));
                }
                $modList.append($tbl);


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
                                if(owner>0) { $li.append(', ') }
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


            refreshClientGroups: function() {
                var self = this;
                self.$clientGroupList.empty();
                return self.getClientGroups()
                    .then(function() {
                        self.renderClientGroupList();
                    });
            },

            renderClientGroupList: function() {
                var self = this;

                var $modifyGroup = $('<div>').css('margin','1em');
                var $groupList = $('<div>').css('margin','1em');

                self.$clientGroupList.append($modifyGroup);
                self.$clientGroupList.append($groupList);


                var $appId = $('<input type="text" size="50" placeholder="module_name/app_id">').addClass('form-control').css('margin','4px');
                var $groups = $('<input type="text" size="50" placeholder="group1,group2, ...">').addClass('form-control').css('margin','4px');

                var $modify = $('<button>').addClass('btn btn-default').append($('<i>').addClass('fa fa-plus')).css('margin-left','10px');

                var $result = $('<div>');

                $modifyGroup.append($('<b>').append('Modify App Client Groups:')).append(' (leave groups blank to reset to default)').append('<br>')
                $modifyGroup.append(
                    $('<div>').addClass('input-group').css('width','35%')
                        .append($appId)
                        .append($groups)
                        .append($('<span>').addClass('input-group-btn')
                            .append($modify)))
                    .append($result);
                $modify.on('click', function() {
                    var appId = $appId.val();
                    var groups = $groups.val();
                    $groups.val('');
                    var groupsList = [];
                    var gList = groups.split(',')
                    for(var k=0; k<gList.length; k++) {
                        var cli_grp = gList[k].trim();
                        if(cli_grp) {
                            groupsList.push(cli_grp);
                        }
                    }

                    self.catalog.set_client_group( { app_id:appId, client_groups:groupsList } )
                        .then(function () {
                            $result.empty();
                            return self.refreshClientGroups();
                        })
                        .catch(function (err) {
                            console.error('ERROR');
                            console.error(err);
                            $result.prepend($('<div role=alert>').addClass('alert alert-danger')
                                .append('<b>Error:</b> '+err.error.message));
                        })
                });


                var $tbl = $('<table>').addClass('table table-hover table-condensed');
                for(var k=0; k<self.client_groups.length; k++) {

                    // loop to get client group string
                    var cliGroupString = '';
                    for(var i=0; i<self.client_groups[k].client_groups.length; i++) {
                        if(i>0) { cliGroupString += ", "}
                        cliGroupString += self.client_groups[k].client_groups[i];
                    }

                    $tbl.append(
                        $('<tr>')
                            .append($('<td>')
                                .append($('<a href="#appcatalog/app/'+self.client_groups[k].app_id+'/dev">').append(self.client_groups[k].app_id)))
                            .append($('<td>')
                                .append(cliGroupString)));
                }
                $groupList.append($tbl);


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

            getClientGroups: function() {
                var self = this
                self.client_groups = [];
                return self.catalog.get_client_groups({})
                    .then(function (groups) {

                        var non_empty_groups = [];
                        for(var k=0; k<groups.length; k++) {
                            if(groups[k].client_groups.length>0) {
                                non_empty_groups.push(groups[k]);
                            }
                        }
                        non_empty_groups.sort(function(a,b) {
                            if(a.app_id < b.app_id) return -1;
                            if(a.app_id > b.app_id) return 1;
                            return 0;
                        });

                        self.client_groups = non_empty_groups;
                    })
                    .catch(function (err) {
                        console.error('ERROR');
                        console.error(err);
                    });
            },


            getReleasedModuleList: function() {
                var self = this

                return self.catalog.list_basic_module_info({
                        include_unreleased:0,
                        include_released:1
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

                        self.released_modules = good_modules;
                    })
                    .catch(function (err) {
                        console.error('ERROR');
                        console.error(err);
                    });
            },

            getUnreleasedModuleList: function() {
                var self = this

                return self.catalog.list_basic_module_info({
                        include_unreleased:1,
                        include_released:0
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

                        self.unreleased_modules = good_modules;
                    })
                    .catch(function (err) {
                        console.error('ERROR');
                        console.error(err);
                    });
            },

            getModuleList: function() {
                var self = this

                return self.catalog.list_basic_module_info({
                        include_unreleased:1,
                        include_released:1
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

                        // get the inactive module list by getting everything, and showing only those on this list
                        // and not in self.module_list; need to improve this catalog API method!!
                        return self.catalog.list_basic_module_info({
                                    include_disabled:1,
                                    include_unreleased:1,
                                    include_released:1,
                                })
                                .then(function (module_list) {
                                    var good_modules = []
                                    for(var k=0; k<module_list.length; k++) {
                                        if(module_list[k].module_name) {
                                            var found = false;
                                            for(var j=0; j<self.module_list.length; j++) {
                                                if(module_list[k].module_name === self.module_list[j].module_name) {
                                                    found = true;
                                                    break;
                                                }
                                            }
                                            if(found) {
                                                continue;
                                            }
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

                                    self.inactive_modules = good_modules;
                                })
                                .catch(function (err) {
                                    console.error('ERROR');
                                    console.error(err);
                                });



                    })
                    .catch(function (err) {
                        console.error('ERROR');
                        console.error(err);
                    });
            }
        });
    });



