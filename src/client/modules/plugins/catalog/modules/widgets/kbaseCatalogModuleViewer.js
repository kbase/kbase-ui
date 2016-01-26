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
    './app_card',
    'plugins/catalog/modules/widgets/kbaseCatalogRegistration',
    'kb/widget/legacy/authenticatedWidget',
    'bootstrap',
],
    function ($, NarrativeMethodStore, Catalog, CatalogUtil, AppCard) {
        $.KBWidget({
            name: "KBaseCatalogModuleViewer",
            parent: "kbaseAuthenticatedWidget",  // todo: do we still need th
            options: {
                module_name: null
            },
            $mainPanel: null,
            $errorPanel: null,

            // clients to the catalog service and the NarrativeMethodStore
            catalog: null,
            nms: null,

            // 
            module_name: null,
            moduleDetails: null,
            appList: null,
            isGithub: null,

            // main panel and elements
            $mainPanel: null,
            $appsPanel: null,
            $loadingPanel: null,

            init: function (options) {
                this._super(options);

                var self = this;

                self.module_name = options.module_name;
                self.isGithub = false;

                // new style we have a runtime object that gives us everything in the options
                self.runtime = options.runtime;
                self.setupClients();
                self.util = new CatalogUtil();

                //console.log(options);
                //console.log(this.runtime.service('session').getUsername());

                // initialize and add the main panel
                self.$loadingPanel = self.util.initLoadingPanel();
                self.$elem.append(self.$loadingPanel);
                var mainPanelElements = self.initMainPanel();
                //[$mainPanel, $header, $adminPanel, $appsPanel, $descriptionPanel, $versionsPanel];
                self.$mainPanel = mainPanelElements[0];
                self.$headerPanel = mainPanelElements[1];
                self.$adminPanel = mainPanelElements[2];
                self.$appsPanel = mainPanelElements[3];
                self.$descriptionPanel = mainPanelElements[4];
                self.$versionsPanel = mainPanelElements[5];

                self.$elem.append(self.$mainPanel);
                self.showLoading();

                // get the module information
                var loadingCalls = [];
                self.moduleDetails = { info:null, versions:null };
                loadingCalls.push(self.getModuleInfo());
                loadingCalls.push(self.getModuleVersions());
                loadingCalls.push(self.getModuleStatus());

                // when we have it all, then render the list
                Promise.all(loadingCalls).then(function() {
                    self.render();
                    self.hideLoading();

                    self.getAppInfo()
                        .then(function() {
                            self.renderApps();
                        })
                });


                return this;
            },

            renderCollapsableVersionDiv: function(title, $content) {
                // todo: replace this cut/paste with a function
                var $div = $('<div>').css('margin-top','1em');
                var $content = $('<div>').css('margin','1em').append($content).hide();
                var $toggle = $('<i>').addClass('fa fa-chevron-right').css('margin-left','15px');
                $div.append(
                        $('<div>').css('cursor','pointer')
                            .append($('<h4>').append(title).css('display','inline'))
                            .append($toggle)
                            .on('click', function() {
                                        if($toggle.hasClass('fa-chevron-right')) {
                                            // hidden, so show
                                            $toggle.removeClass('fa-chevron-right');
                                            $toggle.addClass('fa-chevron-down');
                                            $content.slideDown();
                                        } else {
                                            $toggle.removeClass('fa-chevron-down');
                                            $toggle.addClass('fa-chevron-right');
                                            $content.slideUp();
                                        }
                                    }));
                $div.append($content);
                return $div;
            },


            render: function() {
                var self = this;

                var info = self.moduleDetails.info;
                var versions = self.moduleDetails.versions;

                // determine current version
                var verStrHeader = '(under development)'
                if(self.moduleDetails.info.release) {
                    verStrHeader = self.moduleDetails.info.release.version;
                } else if (self.moduleDetails.beta) {
                    verStrHeader = 'beta';
                }

                // HEADER
                var $header = $('<div>');
                $header
                    .append($('<h1>').css('display','inline')
                        .append(info.module_name))
                    .append($('<span>').css({'font-weight':'bold','font-size':'1.2em','margin-left':'0.5em'})
                        .append(verStrHeader));

                $header.append($('<h4>').append(
                    '<a href="'+info.git_url+'" target="_blank">'+info.git_url+'<a>'));

                var isOwner = false;
                var $owners = $('<div>').append('<i>Developed by:</i> ');
                for(var k=0; k<info.owners.length; k++) {
                    // todo: get nice name
                    var username = info.owners[k];
                    if(k>0) { $owners.append(', '); }
                    $owners.append('<a href="#people/'+username+'">'+username+"</a>");
                    if(self.runtime.service('session').getUsername() === info.owners[k]) {
                        isOwner = true;
                    }
                }
                $header.append($owners);

                self.$headerPanel.append($header);


                // ADMIN PANEL IF OWNER
                if(isOwner) {
                    self.$adminPanel.append('<b>You are a module owner</b><br>');
                    self.$adminPanel.append(self.renderModuleAdminDiv());
                }


                //DESCRIPTION PANEL
                self.$descriptionPanel.append($('<div>').html(info.description));



                
                //VERSIONS PANEL
                var $versionDiv = $('<div>');

                if(info.release) {
                    $versionDiv.append(self.renderCollapsableVersionDiv(
                        'Latest Release Version',
                        self.renderVersion('release',info.release)
                        ));
                } else {
                    $versionDiv.append('<i>This module has not been released.</i><br>');
                }

                if(info.beta) {
                    $versionDiv.append(self.renderCollapsableVersionDiv(
                        'Beta Version',
                        self.renderVersion('beta',info.beta)
                        ));
                } else {
                    $versionDiv.append('<i>This module has no beta version.</i><br>');
                }

                if(info.dev) {
                    $versionDiv.append(self.renderCollapsableVersionDiv(
                        'Development Version',
                        $('<div>')
                            .append('<a href="#appcatalog/status/'+info.module_name+'">View recent registrations</a><br><br>')
                            .append(self.renderVersion('dev',info.dev))
                        ));
                } else {
                    $versionDiv.append('<i>This module has not yet completed a successful registration.</i>');
                }

                self.$versionsPanel.append($versionDiv);
                

                if(versions) {
                    if(versions.length>0) {
                        var $oldReleaseDiv = $('<div>');
                        for(var v=0; v<versions.length; v++) {
                            $oldReleaseDiv.append(self.renderCollapsableVersionDiv(
                                versions[v].version,
                                self.renderVersion(versions[v].version,versions[v])
                            ));
                        }
                        $versionDiv.append(self.renderCollapsableVersionDiv(
                            'Old Releases',
                            $oldReleaseDiv));
                    }
                }

                console.log('Module Details:')
                console.log(self.moduleDetails);
            },

            // tag=dev/beta/release/version number, version=the actual info
            renderVersion: function(tag, version) {
                if(tag) {
                    if(tag!=='release' && tag!=='beta' && tag!=='dev') {
                        tag = null;
                    }
                }

                var self = this;
                var git_url = this.moduleDetails.info.git_url;
                var $verDiv = $('<div>');

                // Check state here, it may be registering currently

                $verDiv.append('<b>Version:</b> ' + version.version + '<br>');
                $verDiv.append('<b>Registration Timestamp:</b> ' + new Date(version.timestamp).toLocaleString() + ' - ' + version.timestamp + '<br>');
                if(self.isGithub) {
                    $verDiv.append('<b>Commit:</b> <a href="'+git_url+'/tree/' + version.git_commit_hash+
                        '" target="_blank">'+version.git_commit_hash+'</a><br>');
                } else {
                    $verDiv.append('<b>Commit:</b> ' + version.git_commit_hash+'<br>');
                }
                $verDiv.append('<b>Commit Mssg:</b> ' + version.git_commit_message+'<br>');
                $verDiv.append('<b>Narrative Apps/Methods:</b> ');


                if(version.narrative_methods) {
                    if(version.narrative_methods.length>0) {
                        $verDiv.append('<br>');
                        var $l = $('<ul>');
                        for(var i=0; i<version.narrative_methods.length; i++) {
                            var id = version.narrative_methods[i];
                            if(tag) {

                                $l.append('<li><a href="#appcatalog/app/'+this.moduleDetails.info.module_name+'/'+id+'/'+tag+
                                    '">'+id+'</a></li>');
                            } else {
                                $l.append('<li><a href="#appcatalog/app/'+this.moduleDetails.info.module_name+'/'+id+
                                    '">'+id+'</a></li>');
                            }
                            /*$l.append('<li><a href="#narrativestore/method/'+this.moduleDetails.info.module_name+'/'+id+
                                '">'+id+'</a></li>');*/
                        }
                        $verDiv.append($l);
                    } else {
                        $verDiv.append('none<br>');
                    }
                } else {
                    $verDiv.append('none<br>');
                }

                return $verDiv;
            },




            renderModuleAdminDiv: function() {
                var self = this;
                var $adminDiv = $('<div>').css('margin','0.5em 0 0.5em 0');

                var $adminContent = $('<div>').hide();
                var $minMaxToggle = $('<i>').addClass('fa fa-chevron-right').css('margin-left','15px');

                $adminDiv.append(
                    $('<div>').css('cursor','pointer')
                        .append($('<h4>').append('Module Admin Tools').css('display','inline'))
                        .append($minMaxToggle)
                        .on('click', function() {
                                    if($minMaxToggle.hasClass('fa-chevron-right')) {
                                        // hidden, so show
                                        $minMaxToggle.removeClass('fa-chevron-right');
                                        $minMaxToggle.addClass('fa-chevron-down');
                                        $adminContent.slideDown();
                                    } else {
                                        $minMaxToggle.removeClass('fa-chevron-down');
                                        $minMaxToggle.addClass('fa-chevron-right');
                                        $adminContent.slideUp();
                                    }
                                }));


                $adminContent.append('<br><a href="#appcatalog/status/'+
                    self.moduleDetails.info.module_name+'">View recent registrations</a><br>')
                
                $adminContent.append('<br><b>Module state information:</b>');
                var $stateTable = $('<table class="table table-striped table-bordered" style="margin-left: auto; margin-right: auto;">');
                $adminContent.append($('<div>').css({'width':'500px', 'margin-left':'2em'}).append($stateTable));
                var width = "15%"
                var state = self.moduleDetails.state
                for (var key in state) {
                    if (state.hasOwnProperty(key)) {
                        $stateTable.append('<tr><th width="'+width+'">'+key+'</th><td>'+JSON.stringify(state[key])+'</td></tr>');
                    }
                }


                $adminContent.append(
                    $('<div>')
                        .append('<b>Register a New Dev Version:</b>')
                        .append(self.renderRegisterDiv())
                    );
                var $manageStatusPanel = $('<div>').css('margin','1.0em');
                $adminContent.append(
                    $('<div>').css('margin-top','1em')
                        .append('<b>Manage Releases:</b><br>')
                        .append(
                            $('<button>').addClass('btn btn-default').append('Migrate Current Dev Version to Beta')
                                .on('click', function() {
                                    self.catalog.push_dev_to_beta({module_name:self.module_name})
                                            .then(function () {
                                                $manageStatusPanel
                                                    .prepend($('<div role=alert>').addClass('alert alert-success')
                                                                    .append('Beta version updated.  Refresh the page to see the update.'));

                                            })
                                            .catch(function (err) {
                                                console.error('ERROR in migrating dev to beta');
                                                console.error(err);
                                                $manageStatusPanel
                                                    .prepend($('<div role=alert>').addClass('alert alert-danger')
                                                                    .append('<b>Error:</b> '+err.error.message));
                                            });
                                    }
                                ))
                        .append('&nbsp;&nbsp;&nbsp;')
                        .append(
                            $('<button>').addClass('btn btn-default').append('Request New Release')
                                .on('click', function() {
                                    self.catalog.request_release({module_name:self.module_name})
                                            .then(function () {
                                                $manageStatusPanel
                                                    .prepend($('<div role=alert>').addClass('alert alert-success')
                                                                    .append('Your request has been submitted.'));

                                            })
                                            .catch(function (err) {
                                                console.error('ERROR in migrating dev to beta');
                                                console.error(err);
                                                $manageStatusPanel
                                                    .prepend($('<div role=alert>').addClass('alert alert-danger')
                                                                    .append('<b>Error:</b> '+err.error.message));
                                            });
                                    }
                                ))
                        .append($manageStatusPanel)
                    );

                $adminDiv.append($adminContent);

                return $adminDiv;
            },



            renderRegisterDiv: function() {
                var self = this;
                var $logWidgetDiv = $('<div>')
                var logWidget = $logWidgetDiv["KBaseCatalogRegistration"]({
                    runtime: self.runtime,
                    git_url: self.moduleDetails.info.original_git_url,
                    show_title: false,
                    show_module_links: false

                });
                return $logWidgetDiv;
            },



            renderApps: function() {
                var self = this;

                //self.$appLPanel.append('<i>Note: temporarily showing dev versions</i><br>')
                var $appListContainer = $('<div>').css({
                        padding:'1em 1em 2em 1em',
                        'overflow':'auto',
                        'max-width': '1000px'
                    });
                for(var k=0; k<self.appList.length; k++) {
                    $appListContainer.append(self.appList[k].getNewCardDiv());
                }
                self.$appsPanel.append($appListContainer);
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

                var $header = $('<div>').css('margin','1em');
                var $adminPanel = $('<div>').css('margin','1em');
                var $appsPanel = $('<div>').css('margin','1em');
                var $descriptionPanel = $('<div>').css('margin','1em');
                var $versionsPanel = $('<div>').css('margin','1em');

                $mainPanel
                    .append($header)
                    .append($adminPanel)
                    .append($appsPanel)
                    .append('<hr>')
                    .append($descriptionPanel)
                    .append('<hr>')
                    .append($versionsPanel);

                return [$mainPanel, $header, $adminPanel, $appsPanel, $descriptionPanel, $versionsPanel];
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




            getAppInfo: function() {
                var self = this;

                var tag = 'release';
                var m_names = [];
                if(self.moduleDetails.info.release) {
                    m_names = self.moduleDetails.info.release.narrative_methods;
                } else if(self.moduleDetails.info.beta) {
                    m_names = self.moduleDetails.info.beta.narrative_methods;
                    tag='beta';
                } else if(self.moduleDetails.info.dev) {
                    m_names = self.moduleDetails.info.dev.narrative_methods;
                    tag='dev';
                }
                for(var m=0; m<m_names.length; m++) {
                    m_names[m] = self.moduleDetails.info.module_name + '/' + m_names[m];
                }


                var params = { ids: m_names, tag: tag };
                return self.nms.get_method_brief_info(params)
                    .then(function(info_list) {
                        self.appList = [];

                        for(var k=0; k<info_list.length; k++) {
                            // logic to hide/show certain categories
                            if(self.util.skipApp(info_list[k].categories)) continue;
                            
                            var m = new AppCard('method',info_list[k],tag,self.nms_base_url);
                            self.appList.push(m);
                        }
                    })
                    .catch(function (err) {
                        console.error('ERROR');
                        console.error(err);
                    });

            },


            getModuleInfo: function() {
                var self = this;

                var moduleSelection = {
                    module_name: self.module_name
                };

                return self.catalog.get_module_info(moduleSelection)
                    .then(function (info) {
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
                        var git_url = self.moduleDetails.info.git_url;
                        self.moduleDetails.info['original_git_url'] = self.moduleDetails.info.git_url;
                        var github = 'https://github.com/'
                        if(git_url.substring(0, github.length) === github) {
                            self.isGithub = true;
                            // if it ends with .git and is github, truncate so we get the basic url
                            if(git_url.indexOf('.git', git_url.length - '.git'.length) !== -1) {
                                self.moduleDetails.info.git_url = git_url.substring(0, git_url.length - '.git'.length);

                            }
                        }
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
                        //console.log(versions);
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

            getModuleStatus: function() {
                var self = this

                var moduleSelection = {
                    module_name: self.module_name
                };

                return self.catalog.get_module_state(moduleSelection)
                    .then(function (state) {
                        //console.log(state);
                        /*typedef structure {
                            boolean active;
                            boolean released;
                            string release_approval;
                            string review_message;
                            string registration;
                            string error_message;
                        } ModuleState;*/
                        self.moduleDetails['state'] = state;
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



