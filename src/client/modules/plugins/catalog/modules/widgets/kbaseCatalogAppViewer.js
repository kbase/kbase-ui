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
    'kb/widget/legacy/kbasePrompt',
    'kb/widget/legacy/authenticatedWidget',
    'bootstrap',
],
    function ($, NarrativeMethodStore, Catalog, CatalogUtil, KBasePrompt) {
        $.KBWidget({
            name: "KBaseCatalogAppViewer",
            parent: "kbaseAuthenticatedWidget",
            options: {
                namespace: null, // generally a module name
                id: null,
                tag: 'release'
            },
            $mainPanel: null,
            $errorPanel: null,

            // clients to the catalog service and the NarrativeMethodStore
            catalog: null,
            nms: null,
            nms_base_url: null,

            // narrative method/app info and spec
            appFullInfo: null,
            appSpec: null,

            // module details if an SDK module
            moduleDetails: null,


            init: function (options) {
                this._super(options);

                var self = this;
                self.runtime = options.runtime;
                self.setupClients();
                self.util = new CatalogUtil();

                // handle legacy methods and apps not in an SDK namespace
                if(options.namespace) {
                    if(options.namespace==='l.m') {
                        //self.$elem.append('legacy method');
                        self.isLegacyMethod = true;
                    } else if (options.namespace==='l.a') {
                        // for now, forward to old style page
                        self.isLegacyApp = true;

                        self.$elem.append('&nbsp Legacy apps not supported on this page yet.  Go here for now:' +
                            '<a href="#narrativestore/app/'+options.id+'">'+options.id+"</a>");
                        return this;
                    }
                } else {
                    // assume legacy method if no namespace given
                    self.isLegacyMethod = true;
                    options.namespace='l.m';
                }

                // set some local variables
                self.module_name = options.namespace;
                self.id = options.id;
                self.tag = options.tag;
                self.isGithub = false;


                // initialize and add the main panel
                //self.$elem.addClass('container');
                self.$errorPanel = $('<div>');
                self.$elem.append(self.$errorPanel);

                self.$loadingPanel = self.util.initLoadingPanel();
                self.$elem.append(self.$loadingPanel);
                var mainPanelElements = self.initMainPanel();
                // [$mainPanel, $header, $screenshotsPanel, $descriptionPanel, $paramsPanel, $publicationsPanel, $infoPanel];
                self.$mainPanel = mainPanelElements[0];
                self.$headerPanel = mainPanelElements[1];
                self.$screenshotsPanel = mainPanelElements[2];
                self.$descriptionPanel = mainPanelElements[3];
                self.$paramsPanel = mainPanelElements[4];
                self.$publicationsPanel = mainPanelElements[5];
                self.$infoPanel = mainPanelElements[6];

                self.$elem.append(self.$mainPanel);
                self.showLoading();

                // get the module information
                var loadingCalls = [];
                self.moduleDetails = { info:null, versions:null };
                loadingCalls.push(self.getModuleInfo());
                loadingCalls.push(self.getAppFullInfo());
                loadingCalls.push(self.getAppSpec());

                // when we have it all, then render the list
                Promise.all(loadingCalls).then(function() {
                    //self.render();
                    self.hideLoading();
                    self.renderMethod();
                    self.renderInfo();

                    // must be called after renderMethod, because it relies on elements existing in the dom
                    self.updateFavoritesCounts();
                    self.updateRunStats();
                }).catch(function() {
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
                this.nms_base_url = this.runtime.getConfig('services.narrative_method_store.url');
                this.nms_base_url = this.nms_base_url.substring(0,this.nms_base_url.length-3)
            },



            getAppFullInfo: function() {
                var self = this;

                var params = {};
                if(self.isLegacyMethod) {
                    params.ids = [self.id];
                } else if(self.isLegacyApp) {
                    return;
                } else {
                    // new sdk method
                    params.ids = [self.module_name + '/' + self.id];
                    params.tag = self.tag;
                }

                return self.nms.get_method_full_info(params)
                    .then(function(info_list) {
                        console.log('Method full info:')
                        console.log(info_list);
                        self.appFullInfo = info_list[0];
                    })
                    .catch(function (err) {
                        console.error('ERROR');
                        console.error(err);
                        self.showError(err);
                    });
            },
            getAppSpec: function() {
                var self = this;

                var params = {};
                if(self.isLegacyMethod) {
                    params.ids = [self.id];
                } else if(self.isLegacyApp) {
                    return;
                } else {
                    // new sdk method
                    params.ids = [self.module_name + '/' + self.id];
                    params.tag = self.tag;
                }

                return self.nms.get_method_spec(params)
                    .then(function(specs) {
                        console.log('Specs:')
                        console.log(specs);
                        self.appSpec = specs[0];
                    })
                    .catch(function (err) {
                        console.error('ERROR');
                        console.error(err);
                        self.showError(err);
                    });
            },


            getModuleInfo: function() {
                var self = this;

                if(self.isLegacyMethod) return;
                if(self.isLegacyApp) return;

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
                        self.showError(err);
                    });
            },

            initMainPanel: function($appListPanel, $moduleListPanel) {
                var $mainPanel = $('<div>').addClass('container');

                var $header = $('<div>').css('margin','1em');
                var $screenshotsPanel = $('<div>').css('margin','1em');
                var $descriptionPanel = $('<div>').css('margin','1em');
                var $paramsPanel = $('<div>').css('margin','1em');
                var $publicationsPanel = $('<div>').css('margin','1em');
                var $infoPanel = $('<div>').css('margin','1em');

                $mainPanel.append($('<div>').addClass('kbcb-back-link')
                        .append($('<a href="#appcatalog">').append('<i class="fa fa-chevron-left"></i> back to the Catalog')));
                
                $mainPanel
                    .append($header)
                    .append($screenshotsPanel)
                    .append($descriptionPanel)
                    .append($paramsPanel)
                    .append($publicationsPanel)
                    .append($infoPanel)
                    .append('<br><br><br>');

                return [$mainPanel, $header, $screenshotsPanel, $descriptionPanel, $paramsPanel, $publicationsPanel, $infoPanel];
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

            showError: function (error) {
                this.$errorPanel.empty();

                var $alert = $('<div>').addClass('col-md-12 alert alert-danger');
                this.$errorPanel.append($('<div>').addClass('container')
                                            .append($('<div>').addClass('row')
                                                .append($alert)));

                $alert.append('<strong>Error when fetching Module information.</strong><br><br>');
                if(error.error) {
                    if(error.error.message){
                        $alert.append(error.error.message);
                    }
                }
                $alert.append('<br>');
                this.$errorPanel.show();
            },


            renderInfo: function() {

                var self = this;

                if(self.isLegacyMethod) {
                    self.nms.status()
                        .then( function(status) {
                            var url = status.git_spec_url + "/tree/" + status.git_spec_branch;
                            url += "/methods/" + self.options.id;
                            //truncate out the commit comments. We're guesing about where those start...
                            //assume first four lines are valid header info.
                            var commit = status.git_spec_commit.split(/\r\n|\r|\n/);
                            commit = [commit[0], commit[1], commit[2], commit[3]].join('<br>\n');

                            self.$infoPanel.append(
                                $('<table>').css({border: '1px solid #bbb', margin: '10px', padding: '10px'})
                                /*.append($('<tr>')
                                    .append($('<th>').append('NMS Store URL  '))
                                    .append($('<td>').append(self.runtime.getConfig('services.narrative_method_store.url'))))*/
                                .append($('<tr>')
                                    .append($('<th style = "vertical-align : top; padding-right : 5px">').append('Yaml/Spec Location '))
                                    .append($('<td>').append('<a href="' + url + '" target="_blank">' + url + "</a>")))
                                .append($('<tr>')
                                    .append($('<th style = "vertical-align : top; padding-right : 5px">').append('Method Spec Commit  '))
                                    .append($('<td>').append(commit)))
                                );
                        });
                }


                /*if(self.isGithub) {
                    var url = self.moduleDetails.info.git_url + ;
                    self.$infoPanel.append(
                        $('<table>').addClass('table').css({border: '1px solid #bbb', margin: '10px', padding: '10px'})
                            .append($('<tr>')
                                .append($('<th style = "vertical-align : top; padding-right : 5px">').append('Yaml/Spec Location '))
                                .append($('<td>').append('<a href="' + url + '" target="_blank">' + url + "</a>"))));

                }*/

            },


/*
            appFullInfo: null,
            appSpec: null,
            appMethodSpecs: null,
            fetchAppInfoAndRender: function () {
                var self = this;
                self.narstore.get_app_full_info({ids: [self.options.id]},
                    function (data) {
                        console.log('fetchAppInfoAndRender');
                        self.appFullInfo = data[0];
                        self.narstore.get_app_spec({ids: [self.options.id]},
                            function (spec) {
                                self.appSpec = spec[0];
                                var methodIds = [];
                                for (var s = 0; s < self.appSpec.steps.length; s++) {
                                    methodIds.push(self.appSpec.steps[s].method_id);
                                }
                                self.narstore.get_method_brief_info({ids: methodIds},
                                    function (methods) {
                                        self.appMethodSpecs = {};
                                        for (var m = 0; m < methods.length; m++) {
                                            self.appMethodSpecs[methods[m].id] = methods[m];
                                        }
                                        self.renderApp();
                                    },
                                    function (err) {
                                        self.showError(err);
                                        console.error(err);
                                    });
                            },
                            function (err) {
                                self.showError(err);
                                console.error(err);
                            });
                    },
                    function (err) {
                        self.showError(err);
                        console.error(err);
                    });
            },

            renderApp: function () {
                var self = this;
                var m = self.appFullInfo;
                var spec = self.appSpec;
                var methodSpecs = self.appMethodSpecs;

                var $header =
                    $.jqElem('div')
                    .addClass('row')
                    .css('width', '95%')
                    ;

                var $basicInfo =
                    $.jqElem('div')
                    .addClass('col-md-8')
                    ;

                var $header = $('<div>').addClass("row").css("width", "95%");
                var $basicInfo = $('<div>').addClass("col-md-8");

                $basicInfo.append($.jqElem('div').append($.jqElem('h2').append('App - ' + m.name)));

                if (m.subtitle) {
                    $basicInfo.append($.jqElem('div').append($.jqElem('h4').append(m.subtitle)));
                }

                var $topButtons =
                    $.jqElem('div')
                    .addClass('col-md-4')
                    .css('text-align', 'right')
                    .append(
                        $.jqElem('div')
                        .addClass('btn-group')
                        .append(
                            $('<a href="#/narrativemanager/new?app=' + m.id + '" target="_blank">')
                            .append(
                                $.jqElem('button')
                                .addClass('kb-primary-btn')
                                .append('<span class="fa fa-plus"></span> Launch in New Narrative')
                                )
                            )
                        )
                    ;

                $header.append($basicInfo);
                if (self.auth() && self.auth().token) {
                    $header.append($topButtons);
                }

                self.$mainPanel.append($header);

                if (m.screenshots && m.screenshots.length) {
                    var $ssPanel = $.jqElem('div');
                    $.each(
                        m.screenshots,
                        function (idx, s) {
                            $ssPanel
                                .append(
                                    $.jqElem('a')
                                    .on('click', function (e) {

                                        var $img = $.jqElem('img')
                                            .attr('src', self.nms_base_url + s.url)
                                            .css('width', '100%');

                                        var $prompt = $.jqElem('div').kbasePrompt({body: $img});

                                        $prompt.dialogModal().css('width', '100%');

                                        $prompt.dialogModal().find('.modal-dialog').css('width', '100%');

                                        $prompt.openPrompt();
                                    })
                                    .append(
                                        $.jqElem('img')
                                        .attr('src', self.nms_base_url + s.url)
                                        .attr('width', '300')
                                        )
                                    );
                        }
                    );

                    self.$mainPanel.append($ssPanel);
                }

                if (m.description) {
                    self.$mainPanel
                        .append(
                            $.jqElem('div')
                            .addClass('row')
                            .css('width', '95%')
                            .append(
                                $.jqElem('div')
                                .addClass('col-md-12')
                                .append(
                                    $.jqElem('div')
                                    .append($.jqElem('hr'))
                                    .append(m.description)
                                    )
                                )
                            )
                        .append($.jqElem('hr'));
                }

                if (spec.steps && spec.steps.length) {
                    var $stepsContainer =
                        $.jqElem('div')
                        .css('width', '95%')
                        .append($.jqElem('h4').append('App Steps'));

                    var $stepList = $.jqElem('ul')
                        .css('list-style-type', 'none')
                        .css('padding-left', '0px');
                    $stepsContainer.append($stepList);

                    $.each(
                        spec.steps,
                        function (idx, step) {
                            var $li = $.jqElem('li');

                            var method_spec = methodSpecs[step.method_id];

                            $li.append(
                                $.jqElem('ul')
                                .css('list-style-type', 'none')
                                .append(
                                    $.jqElem('li')
                                    .append($.jqElem('b').append('Step ' + (idx + 1) + '. '))
                                    .append(
                                        $.jqElem('a')
                                        .attr('href', "#narrativestore/method/" + method_spec.id)
                                        .attr('target', '_blank')
                                        .append(method_spec.name)
                                        )
                                    .append(
                                        $.jqElem('ul')
                                        .css('list-style-type', 'none')
                                        .append($.jqElem('li').append(method_spec.subtitle))
                                        )
                                    )
                                );

                            $stepList.append($li);

                        }
                    );

                    self.$mainPanel.append($stepsContainer.append($stepList));
                }

                $.each(
                    self.$mainPanel.find('[data-method-id]'),
                    function (idx, link) {
                        var method_id = $(link).data('method-id');
                        $(link).attr('target', '_blank');
                        $(link).attr('href', "#/narrativestore/method/" + method_id);
                    }
                );
            
                console.log(self.$mainPanel);

            },

*/

            // This should be refactored, but this is the quick fix to get this working
            // TODO: pull out the star stuff as a separate widget, and add it here
            updateFavoritesCounts: function() {
                var self = this;
                var list_app_favorites = { };
                if(self.isLegacyMethod) {
                    list_app_favorites['id'] = self.appFullInfo.id;
                } else if(self.isLegacyApp) {
                    return;
                } else {
                    list_app_favorites['id'] = self.appFullInfo.id.split('/')[1];
                    list_app_favorites['module_name'] = self.moduleDetails.info.module_name;
                }

                return self.catalog.list_app_favorites(list_app_favorites)
                    .then(function (users) {
                        self.setStarCount(users.length);
                         if(self.runtime.service('session').isLoggedIn()) {
                            var me = self.runtime.service('session').getUsername();
                            for(var u=0; u<users.length; users++) {
                                if(users[u].user == me) {
                                    self.onStar = true;
                                    self.$headerPanel.find('.kbcb-star').removeClass('kbcb-star-nonfavorite').addClass('kbcb-star-favorite');
                                }
                            }
                        }

                    })
                    .catch(function (err) {
                        console.error('ERROR');
                        console.error(err);
                    });
            },

            // warning!  will not return a promise if the user is not logged in!
            updateMyFavorites: function() {
                var self = this;
                if(self.runtime.service('session').isLoggedIn()) {
                    return self.catalog.list_favorites(self.runtime.service('session').getUsername())
                        .then(function (favorites) {
                            self.favoritesList = favorites;
                            for(var k=0; k<self.favoritesList.length; k++) {
                                var fav = self.favoritesList[k];
                                var lookup = fav.id;
                                if(fav.module_name_lc != 'nms.legacy') {
                                    lookup = fav.module_name_lc + '/' + lookup
                                }
                                if(self.appLookup[lookup]) {
                                    self.appLookup[lookup].turnOnStar();
                                }
                            }
                        })
                        .catch(function (err) {
                            console.error('ERROR');
                            console.error(err);
                        });
                }
            },

            onStar: false,
            starCount: null,
            getStarCount: function(count) {
                if(this.starCount) return this.starCount;
                return 0;
            },
            setStarCount: function(count) {
                this.starCount = count;
                if(this.starCount<=0) { this.starCount = null; }
                if(this.starCount) {
                    this.$headerPanel.find('.kbcb-star-count').html(count);
                } else {
                    this.$headerPanel.find('.kbcb-star-count').empty();
                }
            },

            starClick: function() {
                var self = this;
                var params = { };
                if(self.isLegacyMethod) {
                    params['id'] = self.appFullInfo.id;
                } else if(self.isLegacyApp) {
                    return;
                } else {
                    params['id'] = self.appFullInfo.id.split('/')[1];
                    params['module_name'] = self.moduleDetails.info.module_name;
                }
                // check if is a favorite
                if(self.onStar) {
                    self.catalog.remove_favorite(params)
                        .then(function () {
                            self.onStar = false;
                            self.$headerPanel.find('.kbcb-star').removeClass('kbcb-star-favorite').addClass('kbcb-star-nonfavorite');
                            self.setStarCount(self.getStarCount()-1);
                        })
                        .catch(function (err) {
                            console.error('ERROR');
                            console.error(err);
                        });
                } else {
                    self.catalog.add_favorite(params)
                        .then(function () {
                            self.onStar = true;
                            self.$headerPanel.find('.kbcb-star').removeClass('kbcb-star-nonfavorite').addClass('kbcb-star-favorite');
                            self.setStarCount(self.getStarCount()+1);
                        })
                        .catch(function (err) {
                            console.error('ERROR');
                            console.error(err);
                        });
                }
            },


            toggleFavorite: function(info, context) {
                var appCard = this;
                var params = {};
                if(info.module_name) {
                    params['module_name'] = info.module_name;
                    params['id'] = info.id.split('/')[1]
                } else {
                    params['id'] = info.id;
                }

                // check if is a favorite
                if(appCard.isStarOn()) {
                    context.catalog.remove_favorite(params)
                        .then(function () {
                            appCard.turnOffStar();
                            appCard.setStarCount(appCard.getStarCount()-1);
                        })
                        .catch(function (err) {
                            console.error('ERROR');
                            console.error(err);
                        });
                } else {
                    context.catalog.add_favorite(params)
                        .then(function () {
                            appCard.turnOnStar();
                            appCard.setStarCount(appCard.getStarCount()+1);
                        })
                        .catch(function (err) {
                            console.error('ERROR');
                            console.error(err);
                        });
                }
            },


            updateRunStats: function() {
                var self = this

                var options = { full_app_ids : [self.appFullInfo.id] }; // eventuall add p
                console.log(options);

                return self.catalog.get_exec_aggr_stats(options)
                    .then(function (stats) {
                        // should only get one for now- when we switch to 'per_week' stats, then we will get one record per week
                        if(stats.length>0) {
                            var s = stats[0];
                            console.log('Stats:')
                            console.log(s);
                            /*
                                full_app_id - optional fully qualified method-spec id including module_name prefix followed
                                    by slash in case of dynamically registered repo (it could be absent or null in case
                                    original execution was started through API call without app ID defined),
                                time_range - one of supported time ranges (currently it could be either '*' for all time
                                    or ISO-encoded week like "2016-W01")
                                total_queue_time - total time difference between exec_start_time and creation_time moments
                                    defined in seconds since Epoch (POSIX),
                                total_exec_time - total time difference between finish_time and exec_start_time moments 
                                    defined in seconds since Epoch (POSIX).

                                typedef structure {
                                    string full_app_id;
                                    string time_range;
                                    int number_of_calls;
                                    int number_of_errors;
                                    float total_queue_time;
                                    float total_exec_time;
                                } ExecAggrStats;
                            */
                            var $row = $('<div>').addClass('row');
                            self.$headerPanel.find('.kbcb-runs')
                                .append($('<div>').addClass('container').append($row))

                            $row
                                .append($('<div>').addClass('col-xs-2')
                                    .append('<i class="fa fa-share"></i>')
                                    .append($('<span>').addClass('kbcb-run-count').append(s.number_of_calls))
                                    .tooltip({title:'Ran in a Narrative '+s.number_of_calls+' times.', container: 'body', placement:'bottom',
                                                    delay:{show: 400, hide: 40}}));

                            var goodCalls = s.number_of_calls - s.number_of_errors
                            var successPercent = ((goodCalls) / s.number_of_calls)*100;

                            $row
                                .append($('<div>').addClass('col-xs-2')
                                    .append('<i class="fa fa-check"></i>')
                                    .append($('<span>').addClass('kbcb-run-count').append(successPercent.toPrecision(3)+'%'))
                                        .tooltip({title:'Ran sucessfully without error '+successPercent.toPrecision(4)+'% of the time ('+
                                            goodCalls + '/' + s.number_of_calls + ' runs).', container: 'body', placement:'bottom',
                                                    delay:{show: 400, hide: 40}}));
                            
                            function getNiceDuration(seconds) {
                                var hours = Math.floor(seconds / 3600);
                                seconds = seconds - (hours * 3600);
                                var minutes = Math.floor(seconds / 60);
                                seconds = seconds - (minutes * 60);

                                var duration = '';
                                if(hours>0) {
                                    duration = hours + 'h '+ minutes + 'm';
                                } else if (minutes>0) {
                                    duration = minutes + 'm ' + Math.round(seconds) + 's'; 
                                }
                                else {
                                    duration = (Math.round(seconds*100)/100) + 's'; 
                                }
                                return duration;

                            }
                            var niceExecTime = getNiceDuration(s.total_exec_time/s.number_of_calls);
                            $row
                                .append($('<div>').addClass('col-xs-2')
                                    .append('<i class="fa fa-clock-o"></i>')
                                    .append($('<span>').addClass('kbcb-run-count').append(niceExecTime))
                                    .tooltip({title:'Average execution time is '+niceExecTime +'.', container: 'body', placement:'bottom',
                                                    delay:{show: 400, hide: 40}}));

                        } // else do nothing
                    })
                    .catch(function (err) {
                        console.error('ERROR');
                        console.error(err);
                    });
            },



            renderMethod: function () {
                var self = this;
                var m = self.appFullInfo;
                var spec = self.appSpec;



                // HEADER - contains logo, title, module link, authors
                var $header = $('<div>').addClass('kbcb-app-page');
                var $topDiv = $('<div>').addClass('kbcb-app-page-header');
                var $logoSpan = $('<div>').addClass('kbcb-app-page-logo');
                // add actual logos here
                $logoSpan.append('<div class="fa-stack fa-3x"><i class="fa fa-square fa-stack-2x method-icon"></i><i class="fa fa-inverse fa-stack-1x fa-cube"></i></div>')
                
                // add actual logos here
                if(m.icon && self.nms_base_url) {
                    if(m.icon.url) {
                        $logoSpan.html($('<img src="'+self.nms_base_url + m.icon.url+'">')
                                            .css({'max-width':'85%', 'padding':'6px 3px 3px 8px',
                                                  'max-height': '85%'}));
                    }
                }



                var $titleSpan = $('<div>').addClass('kbcb-app-page-title-panel');
                

                var versiontag = '';
                if(self.tag) {
                    if(self.tag=='dev') {
                        versiontag = ' (under development)'
                    } else if(self.tag=='beta') {
                        versiontag = ' beta'
                    }
                }

                $titleSpan.append($('<div>').addClass('kbcb-app-page-title').append(m.name).append(
                    $('<span>').css({'font-size':'0.5em','margin-left':'0.5em'})
                        .append(versiontag)));
                

                if(self.moduleDetails.info) {
                    $titleSpan.append($('<div>').addClass('kbcb-app-page-module').append(
                                            $('<a href="#appcatalog/module/'+self.moduleDetails.info.module_name+'">')
                                                .append(self.moduleDetails.info.module_name)));
                }

                if(m.authors.length>0) {
                    var $authorDiv = $('<div>').addClass('kbcb-app-page-authors').append('by ');
                    for(var k=0; k<m.authors.length; k++) {
                        if(k>=1) {
                            $authorDiv.append(', ');
                        }
                        $authorDiv.append($('<a href="#people/'+m.authors[k]+'">')
                                            .append(m.authors[k])
                                            .on('click',function(event) {
                                                // have to stop propagation so we don't go to the app page first
                                                event.stopPropagation();
                                            }));
                    }
                    $titleSpan.append($authorDiv);
                }



                $header.append(
                    $topDiv
                        .append($('<table>').css('width','100%')
                                    .append($('<tr>')
                                        .append($('<td>')
                                            .css({'width':'150px', 'vertical-align':'top'})
                                            .append($logoSpan))
                                        .append($('<td>')
                                            .append($titleSpan))
                                        )));


                var $footerRow = $('<div>').addClass('row');

                var $starDiv = $('<div>').addClass('col-xs-2');
                var $star = $('<span>').addClass('kbcb-star').append('<i class="fa fa-star"></i>');
                if(self.runtime.service('session').isLoggedIn()) {
                    $star.addClass('kbcb-star-nonfavorite');
                    $star.on('click', function(event) {
                        event.stopPropagation();
                        self.starClick();
                    });
                    $starDiv.tooltip({title:'Click on the star to add/remove from your favorites.', placement:'bottom', container:'body',
                                        delay:{show: 400, hide: 40}});
                }
                var $starCount = $('<span>').addClass('kbcb-star-count');
                $starDiv.append($star).append($starCount);


                var $nRuns = $('<div>').addClass('kbcb-runs').addClass('col-xs-10');


                if(self.isLegacyMethod || self.isLegacyApp) {
                    $nRuns.append("<small>Run statistics cannot be displayed for this method.</small>").css('text-align','left');
                }

                $header.append(
                    $('<div>').addClass('kbcb-app-page-stats-bar container').append(
                        $('<div>').addClass('row')
                            .append($starDiv)
                            .append($nRuns)));


                self.$headerPanel.append($header);


                // SUBTITLE -  show subtitle information just below the other header information
                var $subtitle = $('<div>').addClass('kbcb-app-page-subtitle').append(m.subtitle)
                self.$headerPanel.append($subtitle);

                //if (m['ver']) {
                //$basicInfo.append('<div><strong>Version: </strong>&nbsp&nbsp'+m['ver']+"</div>");
                //}

                if (m.contact) {
                    /*$basicInfo
                        .append('<div>')
                        .append('<strong>Help or Questions? Contact: </strong>&nbsp&nbsp')
                        .append(
                            $.jqElem('a')
                            .attr('href', 'mailto:' + m.contact)
                            .append(m.contact))*/
                }

                var $topButtons =
                    $.jqElem('div')
                    .addClass('col-md-4')
                    .css('text-align', 'right')
                    .append(
                        $.jqElem('div')
                        .addClass('btn-group')
                        )
                    ;


               // $header.append($basicInfo);
              //  $header.append($topButtons);

              //  self.$headerPanel.append($header);

                if (m.screenshots && m.screenshots.length) {
                    var $ssPanel = $.jqElem('div');
                    $.each(
                        m.screenshots,
                        function (idx, s) {
                            $ssPanel
                                .append(
                                    $.jqElem('a')
                                    .on('click', function (e) {

                                        var $img = $.jqElem('img')
                                            .attr('src', self.nms_base_url + s.url)
                                            .css('width', '100%')
                                            ;

                                        var $prompt = $.jqElem('div').kbasePrompt(
                                            {
                                                body: $img
                                            }
                                        );

                                        $prompt.dialogModal()
                                            .css('width', '100%')
                                            ;

                                        $prompt.dialogModal().find('.modal-dialog')
                                            .css('width', '100%')
                                            ;

                                        $prompt.openPrompt();
                                    })
                                    .append(
                                        $.jqElem('img')
                                        .attr('src', self.nms_base_url + s.url)
                                        .attr('width', '300')
                                        )
                                    )
                        }
                    );

                    self.$screenshotsPanel.append($ssPanel);
                }


                if (m.description) {
                    self.$descriptionPanel
                        .append(
                            $.jqElem('div')
                            .addClass('row')
                            .css('width', '95%')
                            .append(
                                $.jqElem('div')
                                .addClass('col-md-12')
                                .append(
                                    $.jqElem('div')
                                    .append($.jqElem('hr'))
                                    .append(m.description)
                                    )
                                )
                            )
                        .append($.jqElem('hr'))
                }


                if (spec.parameters && spec.parameters.length) {

                    var $parametersDiv =
                        $.jqElem('div')
                        ;

                    var $paramList = $.jqElem('ul')
                        .css('list-style-type', 'none')
                        .css('padding-left', '0px')
                        ;
                    $parametersDiv.append($paramList);

                    var sortedParams = {
                        inputs: [],
                        outputs: [],
                        parameters: []
                    };

                    $.each(
                        spec.parameters,
                        function (idx, param) {
                            if (param.ui_class === 'input') {
                                sortedParams.inputs.push(param);
                            } else if (param.ui_class === 'output') {
                                sortedParams.outputs.push(param);
                            } else {
                                sortedParams.parameters.push(param);
                            }
                        }
                    );

                    var ucfirst = function (string) {
                        if (string !== undefined && string.length) {
                            return string.charAt(0).toUpperCase() + string.slice(1);
                        }
                    };

                    $.each(
                        ['inputs', 'outputs', 'parameters'],
                        function (idx, ui_class) {

                            if (sortedParams[ui_class].length === 0) {
                                return;
                            }
                            ;

                            var $li = $.jqElem('li').append($.jqElem('h4').append(ucfirst(ui_class)));
                            var $ui_classList = $.jqElem('ul')
                                .css('list-style-type', 'none')
                                .css('padding-left', '0px')
                                ;
                            $li.append($ui_classList);
                            $paramList.append($li);

                            $.each(
                                sortedParams[ui_class],
                                function (idx, param) {

                                    var types = '';

                                    if (param.text_options && param.text_options.valid_ws_types) {
                                        types = $.jqElem('i').append(' ');
                                        for(var ty=0; ty<param.text_options.valid_ws_types.length; ty++) {
                                            if(ty>0) { types.append(', '); }
                                            var typeName = param.text_options.valid_ws_types[ty];
                                            types.append('<a href="#spec/type/'+typeName+'">' + typeName + '</a>');
                                        }
                                    }

                                    var $li = $.jqElem('li');//.append('Parameter ' + (idx + 1)));

                                    // only show both if they are different
                                    var description= param.short_hint;
                                    console.log(param.short_hint)
                                    console.log(param.description)
                                    if(param.short_hint.trim() !== param.description.trim()) {
                                        description = description + "<br>"+param.description;
                                    }
                                    $li.append(
                                        $.jqElem('ul')
                                        .css('list-style-type', 'none')
                                        .append(
                                            $.jqElem('li')
                                            .append(
                                                $.jqElem('b').append(param.ui_name)
                                                )
                                            .append(types)
                                            .append(
                                                $.jqElem('ul')
                                                .css('list-style-type', 'none')
                                                .append($.jqElem('li').append(description))
                                                )
                                            )
                                        );

                                    $ui_classList.append($li);
                                }
                            );
                        }
                    );

                    self.$paramsPanel.append($parametersDiv.append('<hr>'));
                }

                if (spec.fixed_parameters && spec.fixed_parameters.length) {

                    var $parametersDiv =
                        $.jqElem('div')
                        .append($.jqElem('h4').append('Fixed parameters'))
                        ;

                    var $paramList = $.jqElem('ul')
                        .css('list-style-type', 'none')
                        .css('padding-left', '0px')
                        ;
                    $parametersDiv.append($paramList);

                    $.each(
                        spec.fixed_parameters,
                        function (idx, param) {
                            var $li = $.jqElem('li');//.append('Parameter ' + (idx + 1)));
                            $li.append(
                                $.jqElem('ul')
                                .css('list-style-type', 'none')
                                .append(
                                    $.jqElem('li')
                                    .append(
                                        $.jqElem('b').append(param.ui_name)
                                        )
                                    .append(
                                        $.jqElem('ul')
                                        .css('list-style-type', 'none')
                                        .append($.jqElem('li').append(param.description))
                                        )
                                    )
                                );
                            $paramList.append($li);
                        }
                    );
                    self.$paramsPanel.append($parametersDiv.append('<hr>'));
                }

                if (m.publications && m.publications.length) {
                    var $pubsDiv =
                        $.jqElem('div')
                        .append($.jqElem('strong').append('Related publications'))
                    var $publications =
                        $.jqElem('ul')
                        ;
                    $.each(
                        m.publications,
                        function (idx, pub) {
                            $publications.append(
                                $.jqElem('li')
                                .append(pub.display_text)
                                .append(
                                    $.jqElem('a')
                                    .attr('href', pub.link)
                                    .attr('target', '_blank')
                                    .append(pub.link)
                                    )
                                );
                        }
                    );

                    self.$publicationsPanel.append($pubsDiv.append($publications));
                }

                if (m.kb_contributors !== undefined && m.kb_contributors.length) {
                    var $contributorsDiv =
                        $.jqElem('div')
                        .append($.jqElem('strong').append('Team members'))
                    var $contributors =
                        $.jqElem('ul')
                        ;
                    $.each(
                        m.publications,
                        function (idx, name) {
                            $publications.append(
                                $.jqElem('li')
                                .append(name)
                                );
                        }
                    );

                    self.$publicationsPanel.append($pubsDiv.append($publications));
                }

                $.each(
                    self.$mainPanel.find('[data-method-id]'),
                    function (idx, link) {
                        var method_id = $(link).data('method-id');
                        $(link).attr('target', '_blank');
                        $(link).attr('href', "#/narrativestore/method/" + method_id);
                    }
                );

            }
        });
    });



