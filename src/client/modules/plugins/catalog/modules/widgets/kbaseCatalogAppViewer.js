define([
    'jquery',
    'bluebird',
    'kb_service/client/narrativeMethodStore',
    'kb_service/client/catalog',
    '../catalog_util',

    // for effect
    'kb_widget/legacy/prompt',
    'kb_widget/legacy/authenticatedWidget',
    'bootstrap',
], function (
    $,
    Promise,
    NarrativeMethodStore,
    Catalog,
    CatalogUtil
) {
    'use strict';

    function getNiceDuration(seconds) {
        var hours = Math.floor(seconds / 3600);
        seconds = seconds - (hours * 3600);
        var minutes = Math.floor(seconds / 60);
        seconds = seconds - (minutes * 60);

        var duration = '';
        if (hours > 0) {
            duration = hours + 'h ' + minutes + 'm';
        } else if (minutes > 0) {
            duration = minutes + 'm ' + Math.round(seconds) + 's';
        } else {
            duration = (Math.round(seconds * 100) / 100) + 's';
        }
        return duration;
    }

    $.KBWidget({
        name: 'KBaseCatalogAppViewer',
        parent: 'kbaseAuthenticatedWidget',
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
            if (options.namespace) {
                if (options.namespace === 'l.m') {
                    //self.$elem.append('legacy method');
                    self.isLegacyMethod = true;
                } else if (options.namespace === 'l.a') {
                    // for now, forward to old style page
                    self.isLegacyApp = true;

                    self.$elem.append('&nbsp Legacy apps not supported on this page yet.  Go here for now:' +
                        '<a href="#narrativestore/app/' + options.id + '">' + options.id + '</a>');
                    return this;
                }
            } else {
                // assume legacy method if no namespace given
                self.isLegacyMethod = true;
                options.namespace = 'l.m';
            }

            // set some local variables
            self.module_name = options.namespace;
            self.id = options.id;
            self.tag = options.tag;
            self.isGithub = false;

            // initialize and add the main panel
            //self.$elem.addClass('container-fluid');
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

            // get the module information first, then get the app spec info
            self.moduleDetails = { info: null, versions: null };
            self.getModuleInfo()
                .then(function () {
                    var loadingCalls = [];
                    loadingCalls.push(self.getAppFullInfo());
                    loadingCalls.push(self.getAppSpec());

                    // when we have it all, then render the list
                    return Promise.all(loadingCalls).then(function () {
                        //self.render();
                        self.hideLoading();
                        self.renderMethod();
                        self.renderInfo();

                        // must be called after renderMethod, because it relies on elements existing in the dom
                        self.updateFavoritesCounts();
                        self.updateRunStats();
                        return null;
                    }).catch(function (err) {
                        console.error('ERROR');
                        console.error(err);
                        self.showError(err);
                        self.hideLoading();
                    });
                })
                .catch(function (err) {
                    console.error('ERROR');
                    console.error(err);
                    self.showError(err);
                    self.hideLoading();
                });
            return this;
        },

        setupClients: function () {
            this.catalog = new Catalog(
                this.runtime.getConfig('services.catalog.url'), { token: this.runtime.service('session').getAuthToken() }
            );
            this.nms = new NarrativeMethodStore(
                this.runtime.getConfig('services.narrative_method_store.url'), { token: this.runtime.service('session').getAuthToken() }
            );
            this.nms_base_url = this.runtime.getConfig('services.narrative_method_store.url');
            this.nms_base_url = this.nms_base_url.substring(0, this.nms_base_url.length - 3);
        },

        getAppFullInfo: function () {
            var self = this;

            var params = {};
            if (self.isLegacyMethod) {
                params.ids = [self.id];
            } else if (self.isLegacyApp) {
                return Promise.try(function () {});
            } else {
                // new sdk method
                params.ids = [self.module_name + '/' + self.id];
                params.tag = self.tag;
            }

            return self.nms.get_method_full_info(params)
                .then(function (info_list) {
                    self.appFullInfo = info_list[0];
                });
        },
        getAppSpec: function () {
            var self = this;

            var params = {};
            if (self.isLegacyMethod) {
                params.ids = [self.id];
            } else if (self.isLegacyApp) {
                return Promise.try(function () {});
            } else {
                // new sdk method
                params.ids = [self.module_name + '/' + self.id];
                params.tag = self.tag;
            }

            return self.nms.get_method_spec(params)
                .then(function (specs) {
                    // A bit of a hack to bury setting the page title here.
                    if (specs[0]) {
                        self.runtime.send('ui', 'setTitle', [specs[0].info.name, 'App Catalog'].join(' | '));
                    }
                    self.appSpec = specs[0];
                });
        },

        getModuleInfo: function () {
            var self = this;

            if (self.isLegacyMethod) return Promise.try(function () {});
            if (self.isLegacyApp) return Promise.try(function () {});

            var moduleSelection = {
                module_name: self.module_name
            };
            if (self.tag) {
                moduleSelection.version = self.tag;
            }

            return self.catalog.get_module_version(moduleSelection)
                .then(function (info) {
                    if (!self.tag) {
                        self.tag = info['git_commit_hash'];
                    }

                    // make sure the ID and module name case is correct
                    var idTokens = self.id.split('/');
                    if (idTokens.length == 2) {
                        self.id = info.module_name + '/' + idTokens[1];
                    }
                    self.module_name = info.module_name;

                    self.moduleDetails.info = info;
                    var git_url = self.moduleDetails.info.git_url;
                    self.moduleDetails.info['original_git_url'] = self.moduleDetails.info.git_url;
                    var github = 'https://github.com/';
                    if (git_url.substring(0, github.length) === github) {
                        self.isGithub = true;
                        // if it ends with .git and is github, truncate so we get the basic url
                        if (git_url.indexOf('.git', git_url.length - '.git'.length) !== -1) {
                            self.moduleDetails.info.git_url = git_url.substring(0, git_url.length - '.git'.length);
                        }
                    }
                })
                .catch(function (err) {
                    console.error('ERROR');
                    console.error(err);
                    self.showError(err);
                    self.hideLoading();
                });
        },

        initMainPanel: function () {
            var $mainPanel = $('<div>').addClass('container-fluid');

            var $header = $('<div>').css('margin', '1em');
            var $screenshotsPanel = $('<div>').css('margin', '1em');
            var $descriptionPanel = $('<div>').css('margin', '1em');
            var $paramsPanel = $('<div>').css('margin', '1em');
            var $publicationsPanel = $('<div>').css('margin', '1em');
            var $infoPanel = $('<div>').css('margin', '1em');

            $mainPanel.append($('<div>').addClass('kbcb-back-link')
                .append($('<a href="#catalog/apps">').append('<i class="fa fa-chevron-left"></i> back to the Catalog')));

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

        showError: function (error) {
            this.$errorPanel.empty();

            var $alert = $('<div>').addClass('col-md-12 alert alert-danger');
            this.$errorPanel.append($('<div>').addClass('container-fluid')
                .append($('<div>').addClass('row')
                    .append($alert)));

            $alert.append('<strong>Error when fetching Module information.</strong><br><br>');
            if (error.error) {
                if (error.error.message) {
                    $alert.append(error.error.message);
                }
            }
            $alert.append('<br>');
            this.$errorPanel.show();
        },


        renderInfo: function () {

            var self = this;

            if (self.isLegacyMethod) {
                return self.nms.status()
                    .then(function (status) {
                        var url = status.git_spec_url + '/tree/' + status.git_spec_branch;
                        url += '/methods/' + self.options.id;
                        //truncate out the commit comments. We're guesing about where those start...
                        //assume first four lines are valid header info.
                        var commit = status.git_spec_commit.split(/\r\n|\r|\n/);
                        commit = [commit[0], commit[1], commit[2], commit[3]].join('<br>\n');

                        self.$infoPanel.append(
                            $('<table>').css({ border: '1px solid #bbb', margin: '10px', padding: '10px' })
                            /*.append($('<tr>')
                                .append($('<th>').append('NMS Store URL  '))
                                .append($('<td>').append(self.runtime.getConfig('services.narrative_method_store.url'))))*/
                                .append($('<tr>')
                                    .append($('<th style = "vertical-align : top; padding-right : 5px">').append('Yaml/Spec Location '))
                                    .append($('<td>').append('<a href="' + url + '" target="_blank">' + url + '</a>')))
                                .append($('<tr>')
                                    .append($('<th style = "vertical-align : top; padding-right : 5px">').append('Method Spec Commit  '))
                                    .append($('<td>').append(commit)))
                        );
                    });
            } else {
                // sdk App, so check if we can get some info here
                if (self.moduleDetails.info) {
                    var p = '5px';
                    if (self.isGithub) {
                        var url = self.moduleDetails.info.git_url + '/tree/' + self.moduleDetails.info.git_commit_hash;
                        url += '/ui/narrative/methods/' + self.options.id;
                        self.$infoPanel.append('<br>');
                        self.$infoPanel.append(
                            $('<table>').css({ border: '1px solid #bbb', margin: '10px' })
                                .append($('<tr>')
                                    .append($('<th style = "vertical-align : top;" >').css('padding', p).append('App Specification: '))
                                    .append($('<td>').css('padding', p).append('<a href="' + url + '" target="_blank">' + url + '</a>')))
                                .append($('<tr>')
                                    .append($('<th style = "vertical-align : top;" >').css('padding', p).append('Module Commit:  '))
                                    .append($('<td>').css('padding', p).append(self.moduleDetails.info.git_commit_hash)))
                        );
                    } else {
                        self.$infoPanel.append('<br>');
                        self.$infoPanel.append(
                            $('<table>').css({ border: '1px solid #bbb', margin: '10px' })
                                .append($('<tr>')
                                    .append($('<th style = "vertical-align : top;" >').css('padding', p).append('Git URL: '))
                                    .append($('<td>').css('padding', p).append('<a href="' + self.moduleDetails.info.git_url + '" target="_blank">' + self.moduleDetails.info.git_url + '</a>')))
                                .append($('<tr>')
                                    .append($('<th style = "vertical-align : top;" >').css('padding', p).append('Module Commit:  '))
                                    .append($('<td>').css('padding', p).append(self.moduleDetails.info.git_commit_hash)))
                        );
                    }
                }

            }
            return Promise.try(function () {});

        },

        // This should be refactored, but this is the quick fix to get this working
        // TODO: pull out the star stuff as a separate widget, and add it here
        updateFavoritesCounts: function () {
            var self = this;
            var list_app_favorites = {};
            if (self.isLegacyMethod) {
                list_app_favorites['id'] = self.appFullInfo.id;
            } else if (self.isLegacyApp) {
                return;
            } else {
                list_app_favorites['id'] = self.appFullInfo.id.split('/')[1];
                list_app_favorites['module_name'] = self.moduleDetails.info.module_name;
            }

            return self.catalog.list_app_favorites(list_app_favorites)
                .then(function (users) {
                    self.setStarCount(users.length);
                    if (self.runtime.service('session').isLoggedIn()) {
                        var me = self.runtime.service('session').getUsername();
                        for (var u = 0; u < users.length; u++) {
                            if (users[u].user == me) {
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
        updateMyFavorites: function () {
            var self = this;
            if (self.runtime.service('session').isLoggedIn()) {
                return self.catalog.list_favorites(self.runtime.service('session').getUsername())
                    .then(function (favorites) {
                        self.favoritesList = favorites;
                        for (var k = 0; k < self.favoritesList.length; k++) {
                            var fav = self.favoritesList[k];
                            var lookup = fav.id;
                            if (fav.module_name_lc != 'nms.legacy') {
                                lookup = fav.module_name_lc + '/' + lookup;
                            }
                            if (self.appLookup[lookup]) {
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
        getStarCount: function () {
            if (this.starCount) return this.starCount;
            return 0;
        },
        setStarCount: function (count) {
            this.starCount = count;
            if (this.starCount <= 0) { this.starCount = null; }
            if (this.starCount) {
                this.$headerPanel.find('.kbcb-star-count').html(count);
            } else {
                this.$headerPanel.find('.kbcb-star-count').empty();
            }
        },

        starClick: function () {
            var self = this;
            var params = {};
            if (self.isLegacyMethod) {
                params['id'] = self.appFullInfo.id;
            } else if (self.isLegacyApp) {
                return;
            } else {
                params['id'] = self.appFullInfo.id.split('/')[1];
                params['module_name'] = self.moduleDetails.info.module_name;
            }
            // check if is a favorite
            if (self.onStar) {
                self.catalog.remove_favorite(params)
                    .then(function () {
                        self.onStar = false;
                        self.$headerPanel.find('.kbcb-star').removeClass('kbcb-star-favorite').addClass('kbcb-star-nonfavorite');
                        self.setStarCount(self.getStarCount() - 1);
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
                        self.setStarCount(self.getStarCount() + 1);
                    })
                    .catch(function (err) {
                        console.error('ERROR');
                        console.error(err);
                    });
            }
        },


        toggleFavorite: function (info, context) {
            var appCard = this;
            var params = {};
            if (info.module_name) {
                params['module_name'] = info.module_name;
                params['id'] = info.id.split('/')[1];
            } else {
                params['id'] = info.id;
            }

            // check if is a favorite
            if (appCard.isStarOn()) {
                context.catalog.remove_favorite(params)
                    .then(function () {
                        appCard.turnOffStar();
                        appCard.setStarCount(appCard.getStarCount() - 1);
                    })
                    .catch(function (err) {
                        console.error('ERROR');
                        console.error(err);
                    });
            } else {
                context.catalog.add_favorite(params)
                    .then(function () {
                        appCard.turnOnStar();
                        appCard.setStarCount(appCard.getStarCount() + 1);
                    })
                    .catch(function (err) {
                        console.error('ERROR');
                        console.error(err);
                    });
            }
        },


        updateRunStats: function () {
            var self = this;

            var options = { full_app_ids: [self.appFullInfo.id] };

            return self.catalog.get_exec_aggr_stats(options)
                .then(function (stats) {
                    // should only get one for now- when we switch to 'per_week' stats, then we will get one record per week
                    if (stats.length > 0) {
                        var s = stats[0];
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
                            .append($('<div>').addClass('container-fluid').append($row));

                        $row
                            .append($('<div>').addClass('col-xs-2')
                                .append('<i class="fa fa-share"></i>')
                                .append($('<span>').addClass('kbcb-run-count').append(s.number_of_calls))
                                .tooltip({
                                    title: 'Ran in a Narrative ' + s.number_of_calls + ' times.',
                                    container: 'body',
                                    placement: 'bottom',
                                    delay: { show: 400, hide: 40 }
                                }));

                        var goodCalls = s.number_of_calls - s.number_of_errors;
                        var successPercent = ((goodCalls) / s.number_of_calls) * 100;

                        $row
                            .append($('<div>').addClass('col-xs-2')
                                .append('<i class="fa fa-check"></i>')
                                .append($('<span>').addClass('kbcb-run-count').append(successPercent.toPrecision(3) + '%'))
                                .tooltip({
                                    title: 'Ran sucessfully without error ' + successPercent.toPrecision(4) + '% of the time (' +
                                        goodCalls + '/' + s.number_of_calls + ' runs).',
                                    container: 'body',
                                    placement: 'bottom',
                                    delay: { show: 400, hide: 40 }
                                }));


                        var niceExecTime = getNiceDuration(s.total_exec_time / s.number_of_calls);
                        $row
                            .append($('<div>').addClass('col-xs-2')
                                .append('<i class="fa fa-clock-o"></i>')
                                .append($('<span>').addClass('kbcb-run-count').append(niceExecTime))
                                .tooltip({
                                    title: 'Average execution time is ' + niceExecTime + '.',
                                    container: 'body',
                                    placement: 'bottom',
                                    delay: { show: 400, hide: 40 }
                                }));

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
            $logoSpan.append('<div class="fa-stack fa-3x"><i class="fa fa-square fa-stack-2x method-icon"></i><i class="fa fa-inverse fa-stack-1x fa-cube"></i></div>');

            // add actual logos here
            if (m.icon && self.nms_base_url) {
                if (m.icon.url) {
                    $logoSpan.html($('<img src="' + self.nms_base_url + m.icon.url + '">')
                        .css({
                            'max-width': '85%',
                            'padding': '6px 3px 3px 8px',
                            'max-height': '85%'
                        }));
                }
            }



            var $titleSpan = $('<div>').addClass('kbcb-app-page-title-panel');

            $titleSpan.append($('<div>').addClass('kbcb-app-page-title').append(m.name).append(
                $('<span>').css({ 'font-size': '0.5em', 'margin-left': '0.5em' })
            ));


            if (self.moduleDetails.info) {
                $titleSpan.append($('<div>').addClass('kbcb-app-page-module').append(
                    $('<a href="#catalog/modules/' + self.moduleDetails.info.module_name + '">')
                        .append(self.moduleDetails.info.module_name))
                    .append(' v.' + self.moduleDetails.info.version));
            }

            if (m.authors.length > 0) {
                var $authorDiv = $('<div>').addClass('kbcb-app-page-authors').append('by ');
                for (var k = 0; k < m.authors.length; k++) {
                    if (k >= 1) {
                        $authorDiv.append(', ');
                    }
                    $authorDiv.append($('<a href="#people/' + m.authors[k] + '">')
                        .append(m.authors[k])
                        .on('click', function (event) {
                            // have to stop propagation so we don't go to the app page first
                            event.stopPropagation();
                        }));
                }
                $titleSpan.append($authorDiv);
            }



            $header.append(
                $topDiv
                    .append($('<table>').css('width', '100%')
                        .append($('<tr>')
                            .append($('<td>')
                                .css({ 'width': '150px', 'vertical-align': 'top' })
                                .append($logoSpan))
                            .append($('<td>')
                                .append($titleSpan))
                        )));

            var $starDiv = $('<div>').addClass('col-xs-2');
            var $star = $('<span>').addClass('kbcb-star').append('<i class="fa fa-star"></i>');
            if (self.runtime.service('session').isLoggedIn()) {
                $star.addClass('kbcb-star-nonfavorite');
                $star.on('click', function (event) {
                    event.stopPropagation();
                    self.starClick();
                });
                $starDiv.tooltip({
                    title: 'Click on the star to add/remove from your favorites.',
                    placement: 'bottom',
                    container: 'body',
                    delay: { show: 400, hide: 40 }
                });
            }
            var $starCount = $('<span>').addClass('kbcb-star-count');
            $starDiv.append($star).append($starCount);


            var $releaseTagsDiv = $('<div>').addClass('col-xs-2');

            if (self.moduleDetails.info) {
                var rts = self.moduleDetails.info.release_tags;
                for (var r = 0; r < rts.length; r++) {
                    if (rts[r] === 'release') {
                        $releaseTagsDiv.append($('<span>').addClass('label label-primary').css({ 'padding': '.3em .6em .3em' })
                            .append('R')
                            .tooltip({
                                title: 'Tagged as the latest released version.',
                                placement: 'bottom',
                                container: 'body',
                                delay: { show: 400, hide: 40 }
                            }));
                    }
                    if (rts[r] === 'beta') {
                        $releaseTagsDiv.append($('<span>').addClass('label label-info').css({ 'padding': '.3em .6em .3em' })
                            .append('B')
                            .tooltip({
                                title: 'Tagged as the current beta version.',
                                placement: 'bottom',
                                container: 'body',
                                delay: { show: 400, hide: 40 }
                            }));
                    }
                    if (rts[r] === 'dev') {
                        $releaseTagsDiv.append($('<span>').addClass('label label-default').css({ 'padding': '.3em .6em .3em' })
                            .append('D')
                            .tooltip({
                                title: 'Tagged as the current development version.',
                                placement: 'bottom',
                                container: 'body',
                                delay: { show: 400, hide: 40 }
                            }));
                    }
                }
            } else {
                // this is a legacy method, so it must be released
                $releaseTagsDiv.append($('<span>').addClass('label label-primary').css({ 'padding': '.3em .6em .3em' })
                    .append('R')
                    .tooltip({
                        title: 'Tagged as the latest released version.',
                        placement: 'bottom',
                        container: 'body',
                        delay: { show: 400, hide: 40 }
                    }));
            }



            var $nRuns = $('<div>').addClass('kbcb-runs').addClass('col-xs-8');


            if (self.isLegacyMethod || self.isLegacyApp) {
                $nRuns.append('<small>Run statistics cannot be displayed for this method.</small>').css('text-align', 'left');
            }

            $header.append(
                $('<div>').addClass('kbcb-app-page-stats-bar container').append(
                    $('<div>').addClass('row')
                        .append($starDiv)
                        .append($releaseTagsDiv)
                        .append($nRuns)));


            self.$headerPanel.append($header);


            // SUBTITLE -  show subtitle information just below the other header information
            var $subtitle = $('<div>').addClass('kbcb-app-page-subtitle').append(m.subtitle);
            self.$headerPanel.append($subtitle);

            if (m.screenshots && m.screenshots.length) {
                var $ssPanel = $.jqElem('div');
                $.each(
                    m.screenshots,
                    function (idx, s) {
                        $ssPanel
                            .append(
                                $.jqElem('a')
                                    .on('click', function () {
                                        var $img = $.jqElem('img')
                                            .attr('src', self.nms_base_url + s.url)
                                            .css('width', '100%');

                                        var $prompt = $.jqElem('div').kbasePrompt({
                                            body: $img
                                        });

                                        $prompt.dialogModal()
                                            .css('width', '100%');

                                        $prompt.dialogModal().find('.modal-dialog')
                                            .css('width', '100%');

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

                self.$screenshotsPanel.append($ssPanel);
            }


            if (m.description) {

                // replace instances of emailing help@kbase.us to contact us
                var re = /For questions.{0,50}<a href="mailto:help@kbase.us".{1,50}help@kbase.us.{0,5}<\/a>/g;
                var d_text = m.description.replace(re, 'Questions? Suggestions? Bug reports? Please <a href="http://kbase.us/contact-us/">contact us</a> and include the app name and error message (if any).');

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
                                            .append(d_text)
                                    )
                            )
                    )
                    .append($.jqElem('hr'));
            }


            if (spec.parameters && spec.parameters.length) {

                var $parametersDiv =
                    $.jqElem('div');

                var $paramList = $.jqElem('ul')
                    .css('list-style-type', 'none')
                    .css('padding-left', '0px');
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

                        var $li = $.jqElem('li').append($.jqElem('h4').append(ucfirst(ui_class)));
                        var $ui_classList = $.jqElem('ul')
                            .css('list-style-type', 'none')
                            .css('padding-left', '0px');
                        $li.append($ui_classList);
                        $paramList.append($li);

                        $.each(
                            sortedParams[ui_class],
                            function (idx, param) {

                                var types = '';

                                if (param.text_options && param.text_options.valid_ws_types) {
                                    types = $.jqElem('i').append(' ');
                                    for (var ty = 0; ty < param.text_options.valid_ws_types.length; ty++) {
                                        if (ty > 0) { types.append(', '); }
                                        var typeName = param.text_options.valid_ws_types[ty];
                                        types.append('<a href="#spec/type/' + typeName + '">' + typeName + '</a>');
                                    }
                                }

                                var $li = $.jqElem('li'); //.append('Parameter ' + (idx + 1)));

                                // only show both if they are different
                                var description = param.short_hint;
                                if (param.short_hint.trim() !== param.description.trim()) {
                                    description = description + '<br>' + param.description;
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

                $parametersDiv =
                    $.jqElem('div')
                        .append($.jqElem('h4').append('Fixed parameters'));

                $paramList = $.jqElem('ul')
                    .css('list-style-type', 'none')
                    .css('padding-left', '0px');
                $parametersDiv.append($paramList);

                $.each(
                    spec.fixed_parameters,
                    function (idx, param) {
                        var $li = $.jqElem('li'); //.append('Parameter ' + (idx + 1)));
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
                        .append($.jqElem('strong').append('Related publications'));
                var $publications =
                    $.jqElem('ul');
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
                    $(link).attr('href', '#/narrativestore/method/' + method_id);
                }
            );

        }
    });
});
