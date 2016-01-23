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
            imageUrl: null,

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

                // set some local variables
                self.module_name = options.namespace;
                self.id = options.id;
                self.tag = options.tag;
                self.isGithub = false;


                // initialize and add the main panel
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
                this.imageUrl = this.runtime.getConfig('services.narrative_method_store.url');
                this.imageUrl = this.imageUrl.substring(0,this.imageUrl.length-3);
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
                    });
            },

            initMainPanel: function($appListPanel, $moduleListPanel) {
                var $mainPanel = $('<div>').addClass('kbcb-mod-main-panel');

                var $header = $('<div>').css('margin','1em');
                var $screenshotsPanel = $('<div>').css('margin','1em');
                var $descriptionPanel = $('<div>').css('margin','1em');
                var $paramsPanel = $('<div>').css('margin','1em');
                var $publicationsPanel = $('<div>').css('margin','1em');
                var $infoPanel = $('<div>').css('margin','1em');

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
                                .append($('<tr>')
                                    .append($('<th>').append('NMS Store URL  '))
                                    .append($('<td>').append(self.runtime.getConfig('services.narrative_method_store.url'))))
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
                                            .attr('src', self.imageUrl + s.url)
                                            .css('width', '100%');

                                        var $prompt = $.jqElem('div').kbasePrompt({body: $img});

                                        $prompt.dialogModal().css('width', '100%');

                                        $prompt.dialogModal().find('.modal-dialog').css('width', '100%');

                                        $prompt.openPrompt();
                                    })
                                    .append(
                                        $.jqElem('img')
                                        .attr('src', self.imageUrl + s.url)
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
                var $titleSpan = $('<div>').addClass('kbcb-app-page-title-panel');
                

                var versiontag = '';
                if(self.tag) {
                    if(self.tag=='dev') {
                        versiontag = ' (dev version)'
                    } else if(self.tag=='beta') {
                        versiontag = ' (beta)'
                    }
                }

                $titleSpan.append($('<div>').addClass('kbcb-app-page-title').append(m.name + versiontag));
                

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
                        if(k>=2) {
                            $authorDiv.append(' +'+(m.authors.length-2)+' more');
                            break;
                        }
                        $authorDiv.append($('<a href="#people/'+m.authors[k]+'">')
                                            .append(m.authors[k])
                                            .on('click',function() {
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



                var $starDiv = $('<div>').css('text-align','left');
                var $star = $('<span>').addClass('kbcb-star').append('<i class="fa fa-star"></i>');
                $star.on('click', function() {
                    event.stopPropagation();
                    alert('You have favorited this app - currently does nothing');
                });
                var favoriteCount = Math.floor(Math.random()*100);
                $starDiv.append($star).append('&nbsp;'+favoriteCount);
                $starDiv.tooltip({title:'A favorite method of '+favoriteCount+' people.', placement:'bottom',
                                    delay:{show: 400, hide: 40}});


                var nRuns = Math.floor(Math.random()*10000);
                var $nRuns = $('<div>').css('text-align','left');
                $nRuns.append($('<span>').append('<i class="fa fa-share"></i>'));
                $nRuns.append('&nbsp;'+nRuns);
                $nRuns.tooltip({title:'Run in a narrative '+nRuns+' times.', placement:'bottom',
                                    delay:{show: 400, hide: 40}});


                $header.append(
                    $('<div>').addClass('kbcb-app-page-stats-bar').append(
                        $('<table>')
                            .append($('<tr>')
                                .append($('<td>')
                                    .css({'width':'150px', 'vertical-align':'top'})
                                        .append($starDiv))
                                .append($('<td>')
                                        .append($nRuns))
                                )));


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
                                            .attr('src', self.imageUrl + s.url)
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
                                        .attr('src', self.imageUrl + s.url)
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
                                        types = $.jqElem('i')
                                            .append(' ' + param.text_options.valid_ws_types.join(', '))
                                            ;
                                    }

                                    var $li = $.jqElem('li');//.append('Parameter ' + (idx + 1)));
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
                                                .append($.jqElem('li').append(param.short_hint))
                                                .append($.jqElem('li').append(param.long_hint))
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



