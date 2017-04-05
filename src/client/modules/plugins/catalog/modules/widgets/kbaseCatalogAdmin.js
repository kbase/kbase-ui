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
    '../catalog_util',
    'kb_widget/legacy/authenticatedWidget',
    'bootstrap'
],
    function ($, NarrativeMethodStore, Catalog, CatalogUtil) {
        $.KBWidget({
            name: "KBaseCatalogAdmin",
            parent: "kbaseAuthenticatedWidget",  // todo: do we still need th
            options: {
            },

            // clients to the catalog service and the NarrativeMethodStore
            catalog: null,
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

            isAdmin: null,

            init: function (options) {
                this._super(options);

                var self = this;

                // new style we have a runtime object that gives us everything in the options
                self.runtime = options.runtime;
                self.setupClients();
                self.util = new CatalogUtil();

                self.isAdmin = false;

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
                self.$volumeMountList = mainPanelElements[6];
                self.$secureParams = mainPanelElements[7];
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
                loadingCalls.push(self.checkIsAdmin());

                // when we have it all, then render the list
                Promise.all(loadingCalls).then(function() {

                    if(self.isAdmin) {
                        var adminCalls = [];
                        adminCalls.push(self.getVolumeMounts())
                        Promise.all(adminCalls).then(function(){
                            self.render();
                            self.hideLoading();
                        });
                    } else {
                        self.render();
                        self.hideLoading();
                    }

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
                self.renderVolumeMountList();
                self.renderSecureParamsControls();
            },


            setupClients: function() {
                this.catalog = new Catalog(
                    this.runtime.getConfig('services.catalog.url'),
                    { token: this.runtime.service('session').getAuthToken() }
                );
            },

            initMainPanel: function($appListPanel, $moduleListPanel) {
                var $mainPanel = $('<div>').addClass('container');

                $mainPanel.append($('<div>').addClass('kbcb-back-link')
                        .append($('<a href="#catalog">').append('<i class="fa fa-chevron-left"></i> back to the Catalog Index')));

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

                $mainPanel.append($('<h4>').append('Volume Mounts:'));
                var $volumeMounts = $('<div>');
                $mainPanel.append($volumeMounts);
                $mainPanel.append('<br>');

                $mainPanel.append($('<h4>').append('Secure Parameters:'));
                var $secureParams = $('<div>');
                $mainPanel.append($secureParams);
                $mainPanel.append('<br>');

                $mainPanel.append('<br><br>');

                return [$mainPanel,
                        $basicStatusDiv,
                        $pendingReleaseDiv,
                        $approvedDevelopers,
                        $moduleList,
                        $clientGroups,
                        $volumeMounts,
                        $secureParams];
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

                self.$basicStatusDiv.append('<a href="#catalog/status">Catalog Status Page</a><br><br>');
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
                var $deleteModule = $('<div>').css('margin','1em');
                var $modList = $('<div>').css('margin','1em');
                if(self.isAdmin) {
                    self.$moduleList.append($activateModule);
                    self.$moduleList.append($deleteModule);
                }
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
                                .append($('<a href="#catalog/modules/'+self.released_modules[k].module_name+'">').append(self.released_modules[k].module_name)))
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
                                .append($('<a href="#catalog/modules/'+self.unreleased_modules[k].module_name+'">').append(self.unreleased_modules[k].module_name)))
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
                                .append($('<a href="#catalog/modules/'+self.inactive_modules[k].module_name+'">').append(self.inactive_modules[k].module_name)))
                            .append($('<td>')
                                .append($('<a href="'+self.inactive_modules[k].git_url+'">').append(self.inactive_modules[k].git_url))));
                }
                $modList.append($tbl);


            },

            renderPendingRelease: function() {
                var self = this;

                self.$pendingReleaseDiv.append(
                    $('<button>').addClass('btn btn-default').css('margin','12px')
                            .append($('<i>').addClass('fa fa-refresh')).append(' Refresh')
                            .on('click', function() { self.rerenderPendingRelease(); })
                    );

                if(self.requested_releases.length>0) {
                    var $ul = $('<ul>');
                    for(var k=0; k<self.requested_releases.length; k++) {

                        var addRow = function (mod) {

                            var $li = $('<li>');
                            $li.append('<a href="#catalog/modules/'+mod.module_name+'">'+mod.module_name+'</a>');
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

                            if(self.isAdmin) {
                                $li.append($approveBtn);
                                $li.append($denyBtn);
                                $li.append($resultDiv);
                            }
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

                if(self.isAdmin) {
                    self.$devListDiv.append($addDev);
                }

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


                if(self.isAdmin) {
                    self.$clientGroupList.append($modifyGroup);
                }
                self.$clientGroupList.append($groupList);


                var $modName = $('<input type="text" size="50" placeholder="ModuleName">').addClass('form-control').css('margin','4px');
                var $funcName = $('<input type="text" size="50" placeholder="function_name">').addClass('form-control').css('margin','4px');
                var $groups = $('<input type="text" size="50" placeholder="group1,group2, ...">').addClass('form-control').css('margin','4px');

                var $modify = $('<button>').addClass('btn btn-default').append($('<i>').addClass('fa fa-plus')).css('margin-left','10px');

                var $result = $('<div>');

                $modifyGroup.append($('<b>').append('Add / Modify Client Group Configurations:')).append('<br>')
                $modifyGroup.append(
                    $('<div>').addClass('input-group').css('width','35%')
                        .append($modName)
                        .append($funcName)
                        .append($groups)
                        .append($('<span>').addClass('input-group-btn')
                            .append($modify)))
                    .append($result);
                $modify.on('click', function() {
                    var moduleName = $modName.val();
                    var functionName = $funcName.val();
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

                    self.catalog.set_client_group_config( { module_name:moduleName, function_name:functionName, client_groups:groupsList } )
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
                $tbl.append(
                    $('<tr>')
                        .append($('<th>').append('<b>Module Name</b>'))
                        .append($('<th>').append('<b>Function Name</b>'))
                        .append($('<th>').append('<b>Client Groups</b>'))
                        .append($('<th>')));

                for(var k=0; k<self.client_groups.length; k++) {

                    // loop to get client group string
                    var cliGroupString = '';
                    for(var i=0; i<self.client_groups[k].client_groups.length; i++) {
                        if(i>0) { cliGroupString += ", "}
                        cliGroupString += self.client_groups[k].client_groups[i];
                    }

                    var $trash = $('<span>').css('cursor','pointer').append($('<i class="fa fa-trash-o" aria-hidden="true">'));

                    $trash.on('click', (function(cg) {
                        return function() {
                            var confirm = window.confirm("Are you sure you want to remove this client group configuration?");
                            if (confirm == true) {
                                self.catalog.remove_client_group_config({
                                            'module_name':cg['module_name'],
                                            'function_name':cg['function_name']
                                        })
                                        .then(function () {
                                            $result.empty();
                                            return self.refreshClientGroups();
                                        })
                                        .catch(function (err) {
                                            $result.empty();
                                            console.error('ERROR');
                                            console.error(err);
                                            $result.prepend($('<div role=alert>').addClass('alert alert-danger')
                                                .append('<b>Error:</b> '+err.error.message));
                                        });
                            }
                        }
                    }(self.client_groups[k])));


                    $tbl.append(
                        $('<tr>')
                            .append($('<td>')
                                .append($('<a href="#catalog/modules/'+self.client_groups[k].module_name+'">').append(self.client_groups[k].module_name)))
                            .append($('<td>')
                                .append(self.client_groups[k].function_name))
                            .append($('<td>')
                                .append(cliGroupString))
                            .append($('<td>')
                                .append($trash)));
                }
                $groupList.append($tbl);


            },



            refreshVolumeMounts: function() {
                var self = this;
                self.$volumeMountList.empty();
                return self.getVolumeMounts()
                    .then(function() {
                        self.renderVolumeMountList();
                    });
            },

            renderVolumeMountList: function() {
                var self = this;

                if(!self.isAdmin) {
                    self.$volumeMountList.append($('<div>').css('margin','1em').append('Only Admins can view volume mounts.'));
                    return;
                }

                var $modifyVolMount = $('<div>').css('margin','1em');
                var $volumeMountList = $('<div>').css('margin','1em');


                self.$volumeMountList.append($modifyVolMount);
                self.$volumeMountList.append($volumeMountList);


                var $moduleName = $('<input type="text" size="50" placeholder="ModuleName">').addClass('form-control').css('margin','4px');
                var $functionName = $('<input type="text" size="50" placeholder="function_name">').addClass('form-control').css('margin','4px');
                var $clientGroup = $('<input type="text" size="50" placeholder="client_group_name">').addClass('form-control').css('margin','4px');

                var volumeMountEntry = []; var nOptions = 4;
                for(var x=0; x<nOptions; x++ ){
                    volumeMountEntry.push({
                        '$host_dir':  $('<input type="text" size="50" placeholder="/my/host/path/'+(x+1)+'">').addClass('form-control').css('margin','4px'),
                        '$con_dir' :  $('<input type="text" size="50" placeholder="/my/container/path/'+(x+1)+'">').addClass('form-control').css('margin','4px'),
                        '$rw'      :  $('<select>').addClass('form-control').css('margin','4px')
                                        .append($('<option value="1">').append('Read-only'))
                                        .append($('<option value="0">').append('Read/Write'))
                    });
                }

                var $modify = $('<button>').addClass('btn btn-default').append($('<i>').addClass('fa fa-plus')).append(' Submit Entry').css('margin-left','10px');

                var $result = $('<div>').css('margin','1em');

                $modifyVolMount.append($('<b>').append('Add / Modify Volume Mounts:')).append(' (use the API if you need more than '+nOptions+' mounts)').append('<br>')

                var $volMountInfo = $('<div>');
                for (var x=0; x<volumeMountEntry.length; x++) {
                    var $d = $('<div>').addClass('row');
                    $d.append($('<div>').addClass('col-md-1').append());
                    $d.append($('<div>').addClass('col-md-3').append(volumeMountEntry[x]['$host_dir']));
                    $d.append($('<div>').addClass('col-md-3').append(volumeMountEntry[x]['$con_dir']));
                    $d.append($('<div>').addClass('col-md-2').append(volumeMountEntry[x]['$rw']));
                    $volMountInfo.append($d);
                }

                $modifyVolMount
                    .append($('<div>').addClass('input-group').css('width','35%')
                                .append($moduleName)
                                .append($functionName)
                                .append($clientGroup))
                    .append($volMountInfo)
                    .append($modify)
                    .append($result);

                $modify.on('click', function() {
                    var config = {
                        'volume_mounts':[]
                    }
                    if($moduleName.val()) { config['module_name'] = $moduleName.val() }
                    if($functionName.val()) { config['function_name'] = $functionName.val() }
                    if($clientGroup.val()) { config['client_group'] = $clientGroup.val() }

                    for(var v=0; v<volumeMountEntry.length; v++) {
                        var vme = volumeMountEntry[v];
                        if(vme['$host_dir'].val() && vme['$con_dir'].val()) {
                            config['volume_mounts'].push({
                                'host_dir': vme['$host_dir'].val(),
                                'container_dir': vme['$con_dir'].val(),
                                'read_only': vme['$rw'].val()
                            });
                        }
                    }

                    self.catalog.set_volume_mount(config)
                        .then(function () {
                            $result.empty();
                            return self.refreshVolumeMounts();
                        })
                        .catch(function (err) {
                            $result.empty();
                            console.error('ERROR');
                            console.error(err);
                            $result.prepend($('<div role=alert>').addClass('alert alert-danger')
                                .append('<b>Error:</b> '+err.error.message));
                        })
                });


                var $tbl = $('<table>').addClass('table table-hover table-condensed');
                $tbl.append(
                    $('<tr>')
                        .append($('<th>').append('<b>Module Name</b>'))
                        .append($('<th>').append('<b>Function Name</b>'))
                        .append($('<th>').append('<b>Client Group</b>'))
                        .append($('<th>').append('<b>Host Directory &nbsp;&nbsp;<i class="fa fa-arrow-right"></i>&nbsp;&nbsp; Container Directory</b>'))
                        .append($('<th>')));

                for(var k=0; k<self.volume_mounts.length; k++) {
                    var vm = self.volume_mounts[k];

                    var module_name = vm['module_name'];
                    var function_name = vm['function_name'];
                    var client_group = vm['client_group'];

                    var volMountStr = '';
                    if(vm['volume_mounts'].length == 0) { volMountStr = 'None.'}
                    for(var i=0; i<vm['volume_mounts'].length; i++) {
                        if(i>0) { volMountStr += '<br>'}
                        volMountStr += vm['volume_mounts'][i]['host_dir'] + ' &nbsp;&nbsp;<i class="fa fa-arrow-right"></i>&nbsp;&nbsp; ';
                        volMountStr += vm['volume_mounts'][i]['container_dir'];
                        if(vm['volume_mounts'][i]['read_only'] == 1) {
                            volMountStr += ' &nbsp; (read-only)';
                        } else {
                            volMountStr += ' &nbsp; (r/w)';
                        }
                    }

                    var $trash = $('<span>').css('cursor','pointer').append($('<i class="fa fa-trash-o" aria-hidden="true">'));

                    $trash.on('click', (function(vm) {
                        return function() {
                            var confirm = window.confirm("Are you sure you want to remove this volume mount?");
                            if (confirm == true) {
                                self.catalog.remove_volume_mount({
                                            'module_name':vm['module_name'],
                                            'function_name':vm['function_name'],
                                            'client_group':vm['client_group']
                                        })
                                        .then(function () {
                                            $result.empty();
                                            return self.refreshVolumeMounts();
                                        })
                                        .catch(function (err) {
                                            $result.empty();
                                            console.error('ERROR');
                                            console.error(err);
                                            $result.prepend($('<div role=alert>').addClass('alert alert-danger')
                                                .append('<b>Error:</b> '+err.error.message));
                                        });
                            }
                        }
                    }(vm)));

                    $tbl.append(
                        $('<tr>')
                            .append($('<td>')
                                .append($('<a href="#catalog/modules/'+module_name+'">').append(module_name)))
                            .append($('<td>')
                                .append(function_name))
                            .append($('<td>')
                                .append(client_group))
                            .append($('<td>')
                                .append(volMountStr))
                            .append($('<td>')
                                .append($trash)));
                }
                $volumeMountList.append($tbl);
            },

            /**
             * Creates controls for handling secure parameters in each module.
             * There's two dropdowns - the first is the list of all available modules
             * (might break into active vs inactive? Or put released first?)
             * and the second is a list of available versions. 'all' is an option, too.
             * Once the module and version are selected, there are a couple of options.
             * 1. Get secure params - this lists the parameters and values (as *** if password)
             * 2. Set secure param - two inputs, a key and value.
             */
            renderSecureParamsControls: function() {
                var self = this;
                if (!self.isAdmin) {
                    self.$secureParams.append($('<div>').css('margin','1em').append('Only Admins can manage secure parameters.'));
                    return;
                }

                var currentModule = null;
                var currentVersion = '';
                // Make a select for all modules
                self.$secureParams.append('<div><b>View or Set Secure Parameters</b></div>');
                self.$secureParams.append('<div>First, select a module and version</div>');
                var $moduleSelect = $('<select class="form-control">');
                self.module_list.forEach(function(module, idx) {
                    $moduleSelect.append('<option value="' + idx + '">' + module.module_name + '</option>');
                });

                // Make a select for module versions
                var $versionSelect = $('<select class="form-control">');
                var verOption = function(ver, display) {
                    return '<option value="' + ver + '">' + display + '</option>';
                }
                $moduleSelect.on('change', function(e) {
                    $versionSelect.empty();
                    var module = self.module_list[$moduleSelect.val()];
                    currentModule = module.module_name;
                    currentVersion = '';
                    $versionSelect.append(verOption('', 'all'));
                    if (module.dev) {
                        $versionSelect.append(verOption(module.dev.git_commit_hash, 'dev - ' + module.dev.git_commit_hash));
                    }
                    if (module.beta) {
                        $versionSelect.append(verOption(module.beta.git_commit_hash, 'beta - ' + module.beta.git_commit_hash));
                    }
                    if (module.release) {
                        $versionSelect.append(verOption(module.release.git_commit_hash, 'release - ' + module.release.git_commit_hash));
                    }
                    if (module.release_version_list && module.release_version_list.length > 1) {
                        for (var i=module.release_version_list.length-2; i>=0; i--) {
                            $versionSelect.append(verOption(module.release_version_list[i].git_commit_hash, 'old release - ' + module.release_version_list[i].git_commit_hash));
                        }
                    }
                });
                $moduleSelect.trigger('change');
                $versionSelect.on('change', function(e) {
                    currentVersion = $versionSelect.val();
                });

                self.$secureParams
                    .append($('<div class="row">')
                            .append($('<div class="col-md-1"><b>Module</b></div>'))
                            .append($('<div class="col-md-11">')
                                    .append($moduleSelect)))
                    .append($('<div class="row">')
                            .append($('<div class="col-md-1"><b>Version</b></div>'))
                            .append($('<div class="col-md-11">')
                                    .append($versionSelect)));

                // Add button & div to view params
                var $paramViewDiv = $('<div style="margin-top: 10px">');
                var $getParamsBtn = $('<button>').addClass('btn btn-default').append('Show Parameters');
                var $paramViewArea = $('<div>');
                $paramViewDiv.append($getParamsBtn)
                             .append($paramViewArea);

                $getParamsBtn.click(function() {
                    $paramViewArea.empty();
                    self.catalog.get_secure_config_params({
                        module_name: currentModule,
                        version: currentVersion
                    }).then(function(params) {
                        if (!params || params.length === 0) {
                            $paramViewArea.append('no secure parameters found');
                            return;
                        }
                        params.forEach(function(param) {
                            var p = '<div class="row"><div class="col-md-5"><span class="pull-right">' + param.param_name + '</span></div><div class="col-md-1" style="text-align:center">=</div>';
                            var val = param.param_value;
                            if (param.is_password === 1) {
                                val = '***';
                            }
                            p += '<div class="col-md-5"><span class="pull-left">' + val + '</span></div></div>';
                            $paramViewArea.append(p);
                        });
                    }).catch(function(error) {
                        $paramViewArea.append('Error! Unable to retrieve secure parameters.');
                        console.error(error);
                    });
                });
                self.$secureParams.append($paramViewDiv);

                var $paramSetDiv = $(
                    '<div class="row" style="margin-top: 10px">' +
                        '<div class="col-md-1">' +
                            'Password? <input id="pwcheck" type="checkbox" selected>'+
                        '</div>' +
                        '<div class="col-md-3">' +
                            '<input id="spname" class="form-control" type="text" placeholder="param name" style="margin:4px">' +
                        '</div>' +
                        '<div class="col-md-3">' +
                            '<input id="spval" class="form-control" type="text" placeholder="param value" style="margin:4px">' +
                        '</div>' +
                        '<div class="col-md-1">' +
                            '<button id="spsave" class="btn btn-success">Save</button>' +
                        '</div>' +
                    '</div>'
                );
                $paramSetDiv.find('#pwcheck').on('change', function(e) {
                    var newType = this.checked ? 'password': 'text';
                    $paramSetDiv.find('#spval').attr('type', newType);
                });
                $paramSetDiv.find('button#spsave').click(function() {
                    self.catalog.set_secure_config_params({
                        data: [{
                            module_name: currentModule,
                            version: currentVersion,
                            param_name: $paramSetDiv.find('#spname').val(),
                            param_value: $paramSetDiv.find('#spval').val(),
                            is_password: $paramSetDiv.find('#pwcheck').is(':checked') ? 1 : 0
                        }]
                    }).then(function() {
                        alert('new secure parameter successfully set');
                    }).catch(function(error) {
                        alert('error while setting secure parameter');
                        console.error(error);
                    });
                });
                self.$secureParams.append($paramSetDiv);
            },

            getCatalogVersion: function() {
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
                return self.catalog.list_client_group_configs({})
                    .then(function (groups) {
                        self.client_groups = groups;
                    })
                    .catch(function (err) {
                        console.error('ERROR');
                        console.error(err);
                    });
            },

            getVolumeMounts: function() {
                var self = this
                self.volume_mounts = [];
                return self.catalog.list_volume_mounts({})
                    .then(function (mounts) {
                        self.volume_mounts = mounts;
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
            },

            checkIsAdmin: function() {
                var self = this;

                var me = self.runtime.service('session').getUsername();
                return self.catalog.is_admin(me)
                    .then(function (result) {
                        if(result) {
                            self.isAdmin = true;
                        }
                    })
                    .catch(function (err) {
                        console.error('ERROR');
                        console.error(err);
                    });
            }
        });
    });
