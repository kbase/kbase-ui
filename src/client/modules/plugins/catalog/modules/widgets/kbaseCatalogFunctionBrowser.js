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
    './function_card',
    'kb/widget/legacy/authenticatedWidget',
    'bootstrap',
],
    function ($, NarrativeMethodStore, Catalog, CatalogUtil, FunctionCard) {
        $.KBWidget({
            name: "kbaseCatalogFunctionBrowser",
            parent: "kbaseAuthenticatedWidget",  // todo: do we still need th
            options: {
                tag: null,
            },
            $mainPanel: null,
            $errorPanel: null,

            // clients to the catalog service and the NarrativeMethodStore
            catalog: null,



            // control panel and elements
            $controlToolbar: null,
            $searchBox: null,

            // main panel and elements
            $mainPanel: null,
            $functionListPanel: null,


            functionList: null,

            $loadingPanel: null,

            categories: {},


            init: function (options) {
                this._super(options);
                
                var self = this;

                self.categories = {
                    assembly : 'Assembly',
                    annotation : 'Annotation',
                    metabolic_modeling : 'Metabolic Modeling',
                    comparative_genomics : 'Comparative Genomics',
                    expression : 'Expression',
                    communities : 'Communities',
                    sequence : 'Sequence Alignment & Search',
                    util : 'Utilities'
                };


                // new style we have a runtime object that gives us everything in the options
                self.runtime = options.runtime;
                //console.log(this.runtime.service('session').getUsername());
                self.util = new CatalogUtil();
                self.setupClients();

                // initialize and add the control bar
                var $container = $('<div>').addClass('container');
                self.$elem.append($container);
                var ctrElements = this.renderControlToolbar();
                self.$controlToolbar = ctrElements[0];
                self.$searchBox = ctrElements[1];
                $container.append(this.$controlToolbar);

                // initialize and add the main panel
                self.$loadingPanel = self.util.initLoadingPanel();
                self.$elem.append(self.$loadingPanel);
                var mainPanelElements = self.initMainPanel();
                self.$mainPanel = mainPanelElements[0];
                self.$functionListPanel = mainPanelElements[1];
                $container.append(self.$mainPanel);
                self.showLoading();

                // Default sort is by name
                self.organizeBy = 'name_az';

                if(self.options.tag) {
                    self.tag = self.options.tag;
                    if(self.tag!=='dev' && self.tag!=='beta' && self.tag!=='release') {
                        console.warn('tag '+tag+ ' is not valid! Use: dev/beta/release.  defaulting to release.');
                        self.tag='release';
                    }
                    self.switchVersion(self.tag);
                } else {
                    self.switchVersion('release');
                }
                
                return this;
            },


            setupClients: function() {
                this.catalog = new Catalog(
                    this.runtime.getConfig('services.catalog.url'),
                    { token: this.runtime.service('session').getAuthToken() }
                );
            },



            renderControlToolbar: function () {
                var self = this;

                // CONTROL BAR CONTAINER
                var $nav = $('<nav>').addClass('navbar navbar-default')
                                .css({'border':'0', 'background-color':'#fff'});
                var $container = $('<div>').addClass('container-fluid');

                var $content = $('<div>').addClass('');

                $nav.append($container.append($content));


                // SEARCH
                var $searchBox = $('<input type="text" placeholder="Search" size="50">').addClass('form-control');
                $searchBox.on('input',
                    function() {
                        self.filterFunctions($searchBox.val());
                    })
                    .bind('keypress',function(e) {
                        if (e.keyCode === 13) {
                            return false;
                        }
                    });
                $content.append($('<form>').addClass('navbar-form navbar-left')
                                    .append($('<div>').addClass('form-group')
                                        .append($searchBox)));

                // other controls list
                var $ctrList = $('<ul>').addClass('nav navbar-nav').css('font-family',"'OxygenRegular', Arial, sans-serif");
                $content.append($ctrList);

                // ORGANIZE BY
                var $obMyFavs = $('<a>');

                //var $obRuns = $('<a>').append('Run Count')
                //                    .on('click', function() {self.renderAppList('runs')});
                var $obNameAz = $('<a>').append('Name (a-z)')
                                    .on('click', function() { self.organizeBy='name_az'; self.renderFunctionList(); });
                var $obNameZa = $('<a>').append('Name (z-a)')
                                    .on('click', function() { self.organizeBy='name_za'; self.renderFunctionList(); });
                var $obCat = $('<a>').append('Category')
                                    .on('click', function() { self.organizeBy='category'; self.renderFunctionList(); });
                var $obModule = $('<a>').append('Module')
                                    .on('click', function() { self.organizeBy='module'; self.renderFunctionList(); });
                var $obOwner = $('<a>').append('Developer')
                                    .on('click', function() { self.organizeBy='developer'; self.renderFunctionList(); });
                var $obInput = $('<a>').append('Inputs')
                                    .on('click', function() { self.organizeBy='input_types'; self.renderFunctionList(); });
                var $obOutput = $('<a>').append('Outputs')
                                    .on('click', function() { self.organizeBy='output_types'; self.renderFunctionList(); });

                var $organizeBy = $('<li>').addClass('dropdown')
                                    .append('<a class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">Organize by <span class="caret"></span></a>')

                $organizeBy
                    .append($('<ul>').addClass('dropdown-menu')
                        .append($('<li>')
                            .append($obNameAz))
                        .append($('<li>')
                            .append($obNameZa))
                        .append('<li role="separator" class="divider"></li>')
                        .append($('<li>')
                            .append($obCat))
                        .append($('<li>')
                            .append($obModule))
                        .append($('<li>')
                            .append($obOwner))
                        .append('<li role="separator" class="divider"></li>')
                        .append($('<li>')
                            .append($obInput))
                        .append($('<li>')
                            .append($obOutput)));

                var $verR = $('<a>').append('Latest Release')
                                    .on('click', function() { self.switchVersion('release')});
                var $verB = $('<a>').append('Beta Versions')
                                    .on('click', function() { self.switchVersion('beta')});
                var $verD = $('<a>').append('Development Versions')
                                    .on('click', function() { self.switchVersion('dev')});

                var $version = $('<li>').addClass('dropdown')
                                    .append('<a class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">Version<span class="caret"></span></a>')

                $version
                    .append($('<ul>').addClass('dropdown-menu')
                        .append($('<li>')
                            .append($verR))
                        .append($('<li>')
                            .append($verB))
                        .append($('<li>')
                            .append($verD)));


                // NAV LINKS
                var $statusLink = $('<li>').append($('<a href="#catalog/status">').append('Status'));

                var $registerLink = $('<li>').append($('<a href="#catalog/register">').append('<i class="fa fa-plus-circle"></i> Add Module'));

                var $indexLink = $('<li>').append($('<a href="#catalog">').append('<i class="fa fa-bars"></i> Index'));
                var $helpLink = $('<li>').append($('<a href="https://kbase.us/apps">').append('<i class="fa fa-question-circle"></i> Help'));

                // PLACE CONTENT ON CONTROL BAR
                $content
                    .append($ctrList
                        .append($organizeBy)
                        .append($version)
                        .append($statusLink)
                        .append($registerLink)
                        .append($indexLink)
                        .append($helpLink));

                $nav.append($container)

                return [$nav, $searchBox];
            },

            switchVersion: function(tag) {
                var self = this;
                self.showLoading();
                var loadingCalls = [];
                self.functionList = [];
                self.tag = tag;
                loadingCalls.push(self.refreshLocalFunctionList(tag));

                Promise.all(loadingCalls).then(function() {
                    self.processData();
                    self.hideLoading();
                    self.renderFunctionList();
                    self.filterFunctions(self.$searchBox.val());
                });
            },


            filterFunctions: function(query) {
                var self = this;
                query = query.trim();
                if(query) {
                    var terms = query.toLowerCase().match(/\w+|"(?:\\"|[^"])+"/g);
                    if (terms) {

                        // for everything in the list
                        for(var k=0; k<self.functionList.length; k++) {

                            // for every term (every term must match to get a match)
                            var match = false; // every term must match
                            for(var t=0; t<terms.length; t++) {
                                if(terms[t].charAt(0)=='"' && terms[t].charAt(terms.length-1)=='"' && terms[t].length>2) {
                                    terms[t] = terms[t].substring(1,terms[t].length-1);
                                    // the regex keeps quotes in quoted strings, so toss those
                                }
                                // filter on names
                                if(self.functionList[k].info.name.toLowerCase().indexOf(terms[t]) >= 0) {
                                    match = true; continue;
                                }
                                // filter on module names, if they exist
                                if(self.functionList[k].info.module_name.toLowerCase().indexOf(terms[t]) >= 0) {
                                    match = true; continue;
                                }
                                if(self.functionList[k].info.function_id.toLowerCase().indexOf(terms[t]) >= 0) {
                                    match = true; continue;
                                }
                                // filter on other description
                                if(self.functionList[k].info.short_description.toLowerCase().indexOf(terms[t]) >= 0) {
                                    match = true; continue;
                                }

                                // filter on authors
                                if(self.functionList[k].info.authors) {
                                    var authorMatch = false;
                                    for(var a=0; a<self.functionList[k].info.authors.length; a++) {
                                        if(self.functionList[k].info.authors[a].toLowerCase().indexOf(terms[t]) >= 0) {
                                            authorMatch = true; break;
                                        }
                                    }
                                    if(authorMatch) { match=true; continue; }
                                }

                                // filter on other stuff (input/output types?)


                                // if we get here, this term didnt' match anything, so we can break
                                match = false; break;
                            }


                            // show or hide if we matched
                            if(match) {
                                self.functionList[k].show();
                            } else {
                                self.functionList[k].hide();
                            }
                        }
                    } else {
                        self.clearFilter();
                    }

                } else {
                    self.clearFilter();
                }

                // hide/show sections
                var sections = self.$functionListPanel.find('.catalog-section');
                for(var i=0; i<sections.length; i++) {
                    $(sections[i]).show();
                    var cards = $(sections[i]).find('.kbcb-app-card-container,.kbcb-app-card-list-element');
                    var hasVisible = false;
                    for(var j=0; j<cards.length; j++) {
                        if($(cards[j]).is(':visible')) {
                            hasVisible = true;
                            break;
                        }
                    }
                    if(!hasVisible) {
                        $(sections[i]).hide();
                    }
                }



            },

            clearFilter: function() {
                var self = this;
                for(var k=0; k<self.functionList.length; k++) {
                    self.functionList[k].show();
                }
            },


            initMainPanel: function($appListPanel, $moduleListPanel) {
                var $mainPanel = $('<div>').addClass('container');
                var $functionListPanel = $('<div>');
                $mainPanel.append($functionListPanel);
                return [$mainPanel, $functionListPanel];
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


            refreshLocalFunctionList: function(tag) {

                var self = this

                var localFunctionSelection = {
                    release_tag:tag
                };

                return self.catalog.list_local_functions(localFunctionSelection)
                    .then(function (functions) {

                        /*functions.push({
                            'module_name': 'ModuleName',
                            'function_id': 'function_id',
                            'git_commit_hash': '1241245125_git_hash',
                            'version': '1.0.2',
                            'release_tag': 'release',
                            'authors': ['msneddon'],
                            'name': 'Some Function Something',
                            'short_description': 'This is the example short description',
                            'tags' : {
                                'categories':['converter'],
                                'input': {'file_types':[],'kb_types': ['KB.Genome', 'KB.Contigs']},
                                'output': { 'file_types':['text'],'kb_types':[]}
                            }
                        });
                        functions.push({
                            'module_name': 'ModuleName',
                            'function_id': 'function_id',
                            'git_commit_hash': '1241245125_git_hash',
                            'version': '1.0.2',
                            'release_tag': 'release',
                            'authors': ['msneddon'],
                            'name': 'Some Function Something 2',
                            'short_description': 'This is the example short description',
                            'tags' : {
                                'categories':['converter'],
                                'input': {'file_types':[],'kb_types': ['KB.Genome', 'KB.Contigs']},
                                'output': { 'file_types':['text'],'kb_types':[] }
                            }
                        });
                        functions.push({
                            'module_name': 'OtherModule',
                            'function_id': 'function_id',
                            'git_commit_hash': '1241245125_git_hash',
                            'version': '1.0.2',
                            'release_tag': 'release',
                            'authors': ['dave','tim'],
                            'name': 'Some Function Something 2',
                            'short_description': 'This is the example short description',
                            'tags' : {
                                'categories':['converter'],
                                'input': {'file_types':[],'kb_types': ['KB.Genome', 'KB.Contigs']},
                                'output': { 'file_types':['text'],'kb_types':[] }
                            }
                        });*/

                        self.functionList=[];
                        for(var k=0; k<functions.length; k++) {
                            var card = new FunctionCard(functions[k], self.runtime.service('session').isLoggedIn());
                            self.functionList.push(card);
                        }

                    })
                    .catch(function (err) {
                        console.error('ERROR');
                        console.error(err);
                    });
            },

            /*updateRunStats: function() {
                var self = this

                var options = {};

                return self.catalog.get_exec_aggr_stats(options)
                    .then(function (stats) {
                        self.runStats = stats;
                        for(var k=0; k<stats.length; k++) {

                            var lookup = stats[k].full_app_id;
                            var idTokens = stats[k].full_app_id.split('/');
                            if( idTokens.length === 2) {
                                lookup = idTokens[0].toLowerCase() + '/' + idTokens[1];
                            }
                            if(self.appLookup[lookup]) {
                                self.appLookup[lookup].setRunCount(stats[k].number_of_calls);
                            }
                        }
                    })
                    .catch(function (err) {
                        console.error('ERROR');
                        console.error(err);
                    });
            },*/



            processData: function() {
                var self = this;

                // Lookup table used for run stats:
                /*self.appLookup = {};
                for(var a=0; a<self.appList.length; a++) {
                    // only lookup for methods; apps are deprecated
                    if(self.appList[a].info.module_name) {
                        var idTokens = self.appList[a].info.id.split('/');
                            self.appLookup[idTokens[0].toLowerCase() + '/' + idTokens[1]] = self.appList[a];
                        } else {
                            self.appLookup[self.appList[a].info.id] = self.appList[a];
                        }
                    }
                }*/

                self.developers = {};
                self.inputTypes = {};
                self.outputTypes = {};

                for(var k=0; k<self.functionList.length; k++) {
                    if(self.functionList[k].info.authors.length>0) {
                        var authors = self.functionList[k].info.authors;
                        for(var i=0; i<authors.length; i++) {
                            self.developers[authors[i]] = 1;
                        }
                    }

                    // INPUT TYPE PARSE
                    if(self.functionList[k].info.tags.input.file_types.length>0) {
                        var input_types = self.functionList[k].info.tags.input.file_types;
                        for(var i=0; i<input_types.length; i++) {
                            self.inputTypes['File: '+input_types[i]] = 1;
                        }
                    }
                    if(self.functionList[k].info.tags.input.kb_types.length>0) {
                        var input_types = self.functionList[k].info.tags.input.kb_types;
                        for(var i=0; i<input_types.length; i++) {
                            self.inputTypes['KBase Type: '+input_types[i]] = 1;
                        }
                    }

                    // OUTPUT TYPE PARSE
                    if(self.functionList[k].info.tags.output.file_types.length>0) {
                        var output_types = self.functionList[k].info.tags.output.file_types;
                        for(var i=0; i<output_types.length; i++) {
                            self.outputTypes['File: '+output_types[i]] = 1;
                        }
                    }
                    if(self.functionList[k].info.tags.output.kb_types.length>0) {
                        var output_types = self.functionList[k].info.tags.output.kb_types;
                        for(var i=0; i<output_types.length; i++) {
                            self.outputTypes['KBase Type: '+output_types[i]] = 1;
                        }
                    }
                }
            },


            renderFunctionList: function() {
                var self = this;

                var organizeBy = self.organizeBy;

                self.$functionListPanel.children().detach();

                if(self.tag) {
                    var text_css = {'color':'#777', 'font-size':'1.1em', 'margin':'5px' }
                    if(self.tag == 'dev') {
                        self.$functionListPanel.append($('<div>').css(text_css).append('Currently viewing Functions under development.'));
                    } else if (self.tag == 'beta') {
                        self.$functionListPanel.append($('<div>').css(text_css).append('Currently viewing Functions in beta.'));
                    }
                }



                if(self.functionList.length === 0) {
                    var $listContainer = $('<div>').css({'overflow':'auto', 'padding':'0 0 2em 0'});
                    $listContainer.append('No functions found.');
                    self.$functionListPanel.append($listContainer);
                    return;
                }

                if(!organizeBy) { return; }

                if(organizeBy=='name_az') {
                    // sort by method name, A to Z
                    self.functionList.sort(function(a,b) {
                        if(a.info.name.toLowerCase()<b.info.name.toLowerCase()) return -1;
                        if(a.info.name.toLowerCase()>b.info.name.toLowerCase()) return 1;
                        return 0;
                    });
                    var $listContainer = $('<div>').css({'overflow':'auto', 'padding':'0 0 2em 0'});
                    for(var k=0; k<self.functionList.length; k++) {
                        self.functionList[k].clearCardsAddedCount();
                        $listContainer.append(self.functionList[k].getNewCardDiv());
                    }
                    self.$functionListPanel.append($listContainer);
                }

                else if(organizeBy=='name_za') {
                    // sort by method name, Z to A
                    self.functionList.sort(function(a,b) {
                        if(a.info.name.toLowerCase()<b.info.name.toLowerCase()) return 1;
                        if(a.info.name.toLowerCase()>b.info.name.toLowerCase()) return -1;
                        return 0;
                    });
                    var $listContainer = $('<div>').css({'overflow':'auto', 'padding':'0 0 2em 0'});
                    for(var k=0; k<self.functionList.length; k++) {
                        self.functionList[k].clearCardsAddedCount();
                        $listContainer.append(self.functionList[k].getNewCardDiv());
                    }
                    self.$functionListPanel.append($listContainer);
                }
                else if(organizeBy=='module') {
                    // Organization by module is simple because things can only be in one module, we sort and group them by module

                    self.functionList.sort(function(a,b) {
                        if(a.info.module_name && b.info.module_name) {
                            if(a.info.module_name.toLowerCase()<b.info.module_name.toLowerCase()) return -1;
                            if(a.info.module_name.toLowerCase()>b.info.module_name.toLowerCase()) return 1;
                            if(a.info.name.toLowerCase()<b.info.name.toLowerCase()) return -1;
                            if(a.info.name.toLowerCase()>b.info.name.toLowerCase()) return 1;
                            return 0;
                        }
                        if(a.info.module_name) return -1;
                        if(b.info.module_name) return 1;
                        return 0;
                    });
                    var currentModuleName = '';
                    var $currentModuleDiv = null;
                    for(var k=0; k<self.functionList.length; k++) {
                        self.functionList[k].clearCardsAddedCount();

                        var info = self.functionList[k].info;

                        var m = info.module_name;

                        if(currentModuleName != m) {
                            currentModuleName = m;
                            var $section = $('<div>').addClass('catalog-section');
                            $currentModuleDiv = $('<div>').addClass('kbcb-app-card-list-container');
                            $section.append($('<div>').css({'color':'#777'})
                                    .append($('<h4>').append('<a href="#catalog/modules/'+m+'">'+m+'</a>')));
                            $section.append($currentModuleDiv);
                            self.$functionListPanel.append($section);
                        }
                        $currentModuleDiv.append(self.functionList[k].getNewCardDiv());
                    }
                }

                else if(organizeBy=='developer') {

                    // get and sort the dev list
                    var devs = [];
                    for(var k in self.developers) { devs.push(k); }
                    devs.sort();

                    // create the sections per author
                    var $authorDivLookup = {};
                    for(var k=0; k<devs.length; k++) {
                        var $section = $('<div>').addClass('catalog-section');
                        var $authorDiv = $('<div>').addClass('kbcb-app-card-list-container');
                        $authorDivLookup[devs[k]] = $authorDiv;
                        $section.append(
                            $('<div>').css({'color':'#777'})
                                .append($('<h4>').append('<a href="#people/'+devs[k]+'">'+devs[k]+'</a>')));
                        $section.append($authorDiv)
                        self.$functionListPanel.append($section);
                    }
                    var $section = $('<div>').addClass('catalog-section');
                    var $noAuthorDiv = $('<div>').addClass('kbcb-app-card-list-container');
                    $section.append(
                        $('<div>').css({'color':'#777'})
                            .append($('<h4>').append('No Developer Specified')));
                    $section.append($noAuthorDiv);
                    self.$functionListPanel.append($section);

                    // render the app list
                    for(var k=0; k<self.functionList.length; k++) {
                        self.functionList[k].clearCardsAddedCount();

                        if(self.functionList[k].info.authors.length>0) {
                            var authors = self.functionList[k].info.authors;
                            for(var i=0; i<authors.length; i++) {
                                $authorDivLookup[authors[i]].append(self.functionList[k].getNewCardDiv());
                            }
                        } else {
                            $noAuthorDiv.append(self.functionList[k].getNewCardDiv())
                        }
                    }

                }

                

                else if (organizeBy=='category') {

                    var cats = [];
                    for(var k in self.categories) { cats.push(k); }
                    cats.sort();

                    var $catDivLookup = {}
                    for(var k=0; k<cats.length; k++) {
                        var $section = $('<div>').addClass('catalog-section');
                        var $catDiv = $('<div>').addClass('kbcb-app-card-list-container');
                        $catDivLookup[cats[k]] = $catDiv;
                        $section.append(
                            $('<div>').css({'color':'#777'})
                                .append($('<h4>').append(self.categories[cats[k]])));
                        $section.append($catDiv)
                        self.$functionListPanel.append($section);
                    }
                    var $section = $('<div>').addClass('catalog-section');
                    var $noCatDiv = $('<div>').addClass('kbcb-app-card-list-container');
                    $section.append(
                        $('<div>').css({'color':'#777'})
                            .append($('<h4>').append('Uncategorized')));
                    $section.append($noCatDiv);
                    self.$functionListPanel.append($section);

                    for(var k=0; k<self.functionList.length; k++) {
                        self.functionList[k].clearCardsAddedCount();

                        if(self.functionList[k].info.tags.categories.length>0) {
                            var appCats = self.functionList[k].info.tags.categories;
                            var gotCat = false;
                            for(var i=0; i<appCats.length; i++) {
                                if($catDivLookup.hasOwnProperty(appCats[i])) {
                                    gotCat = true;
                                    $catDivLookup[appCats[i]].append(self.functionList[k].getNewCardDiv());
                                }
                            }
                            if(!gotCat) {
                                $noCatDiv.append(self.functionList[k].getNewCardDiv());
                            }
                        } else {
                            $noCatDiv.append(self.functionList[k].getNewCardDiv());
                        }
                    }

                }

                /*else if (organizeBy=='runs') {

                    self.$functionListPanel.append('<div><i>Note: Run counts for legacy methods released before 2016 are not reported.</i><br><br></div>');

                    // sort by runs, then by app name
                    self.appList.sort(function(a,b) {
                        var aRuns = a.getRunCount();
                        var bRuns = b.getRunCount();
                        if(aRuns>bRuns) return -1;
                        if(bRuns>aRuns) return 1;
                        var aName = a.info.name.toLowerCase();
                        var bName = b.info.name.toLowerCase();
                        if(aName<bName) return -1;
                        if(aName>bName) return 1;
                        return 0;
                    });
                    var $listContainer = $('<div>').css({'overflow':'auto', 'padding':'0 0 2em 0'});
                    for(var k=0; k<self.appList.length; k++) {
                        self.appList[k].clearCardsAddedCount();
                        $listContainer.append(self.appList[k].getNewCardDiv());
                    }
                    self.$functionListPanel.append($listContainer);

                }*/


                else if(organizeBy=='input_types') {
                    // get and sort the type list
                    var types = [];
                    for(var k in self.inputTypes) { types.push(k); }
                    types.sort();

                    // create the sections per author
                    var $typeDivLookup = {};
                    for(var k=0; k<types.length; k++) {
                        var $section = $('<div>').addClass('catalog-section');
                        var $typeDiv = $('<div>').addClass('kbcb-app-card-list-container');
                        $typeDivLookup[types[k]] = $typeDiv;
                        $section.append(
                            $('<div>').css({'color':'#777'})
                                .append($('<h4>').append(types[k])));
                        $section.append($typeDiv)
                        self.$functionListPanel.append($section);
                    }

                    // render the app list
                    for(var k=0; k<self.functionList.length; k++) {
                        self.functionList[k].clearCardsAddedCount();

                        if(self.functionList[k].info.tags.input.file_types.length>0) {
                            var input_types = self.functionList[k].info.tags.input.file_types;
                            for(var i=0; i<input_types.length; i++) {
                                $typeDivLookup["File: "+input_types[i]].append(self.functionList[k].getNewCardDiv());
                            }
                        }

                        if(self.functionList[k].info.tags.input.kb_types.length>0) {
                            var input_types = self.functionList[k].info.tags.input.kb_types;
                            for(var i=0; i<input_types.length; i++) {
                                $typeDivLookup["KBase Type: "+input_types[i]].append(self.functionList[k].getNewCardDiv());
                            }
                        }
                    }
                }

                else if(organizeBy=='output_types') {
                    // get and sort the type list
                    var types = [];
                    for(var k in self.outputTypes) { types.push(k); }
                    types.sort();

                    // create the sections per author
                    var $typeDivLookup = {};
                    for(var k=0; k<types.length; k++) {
                        var $section = $('<div>').addClass('catalog-section');
                        var $typeDiv = $('<div>').addClass('kbcb-app-card-list-container');
                        $typeDivLookup[types[k]] = $typeDiv;
                        $section.append(
                            $('<div>').css({'color':'#777'})
                                .append($('<h4>').append($('<a href="#spec/type/'+types[k]+'">').append(types[k]))));
                        $section.append($typeDiv)
                        self.$functionListPanel.append($section);
                    }

                    // render the app list
                    for(var k=0; k<self.functionList.length; k++) {
                        self.functionList[k].clearCardsAddedCount();

                        if(self.functionList[k].info.tags.output.file_types.length>0) {
                            var output_types = self.functionList[k].info.tags.output.file_types;
                            for(var i=0; i<output_types.length; i++) {
                                $typeDivLookup["File: "+output_types[i]].append(self.functionList[k].getNewCardDiv());
                            }
                        }

                        if(self.functionList[k].info.tags.output.kb_types.length>0) {
                            var output_types = self.functionList[k].info.tags.output.kb_types;
                            for(var i=0; i<output_types.length; i++) {
                                $typeDivLookup["KBase Type: "+output_types[i]].append(self.functionList[k].getNewCardDiv());
                            }
                        }
                    }
                }

                else {
                    self.$functionListPanel.append('<span>invalid organization parameter</span>');
                }


                // gives some buffer at the end of the page
                self.$functionListPanel.append($('<div>').css('padding','4em'));

                self.filterFunctions(self.$searchBox.val());

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



