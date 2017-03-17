/* Directives */

var kbaseNarrativeManager = angular.module('NarrativeManager', []);

kbaseNarrativeManager.factory('NarrativeManager', function() {
    return kbaseNarrativeManager();
});


// define Search as its own module, and what it depends on
var searchApp = angular.module('search', ['ui.router','ui.bootstrap','NarrativeManager']);


// enable CORS for Angular
searchApp.config(function($httpProvider,$stateProvider,$provide) {
        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];

        $stateProvider
            .state('search', {
                url: "/search/?q&category&page&itemsPerPage&sort&facets",
                templateUrl: 'views/search/search.html',
                controller: 'searchController'
            })
            .state('search.recent', {
                url: "/recent/",
                templateUrl: 'views/search/recent.html',
                controller: 'searchController'
            })
            .state('search.favorites', {
                url: "/favorites/",
                templateUrl: 'views/search/favorites.html',
                controller: 'searchController'
            });

        $provide.decorator('$rootScope', ['$delegate', function ($delegate) {
            Object.defineProperty($delegate.constructor.prototype, '$bus', {
                get: function() {
                    var self = this;

                    return {
                        subscribe: function() {
                            var sub = postal.subscribe.apply(postal, arguments);

                            self.$on('$destroy',
                                function() {
                                    sub.unsubscribe();
                                }
                            );
                        },
                        channel: postal.channel,
                        publish: postal.publish
                    };
                },
                enumerable: false
            });

            return $delegate;
        }]);

        
        $(document).ajaxStop($.unblockUI());
    }
);


searchApp.factory("require", function($rootScope) {
    function requireProxy(dependencies, successCallback, errorCallback) {
        successCallback = (successCallback || angular.noop);
        errorCallback = (errorCallback || angular.noop);

        require( (dependencies || []), 
            function successCallbackProxy() {
                var args = arguments;

                $rootScope.$apply(function() {
                    successCallback.apply(this, args);
                });
            },
            function errorCallbackProxy() {
                var args = arguments;

                $rootScope.$apply(function() {
                    errorCallback.apply( this, args );
                });
            }
        );

    }

    return( requireProxy );
});





/* Services */

/*
 *  This service is responsible for fetching the search service category information.
 */
searchApp.service('searchCategoryLoadService', function($q, $http, $rootScope) {
    // Functions for fetching and manipulating model data
    return {
        getCategoryInfo : function () {
            var deferred = $q.defer();
    
            $http.get($rootScope.kb.search_url + "categories").then(function fetchCategories(results) {
                // Override displayTree
                // Here's the crazy logic.  If reference_genomes or GenomeFeatures are found, then
                // the categories are overwritten with 'genomes' and 'features'.  This allows us
                // to mimic the old category from the front-end, but query against the new category
                // on the backend.  Since this is all a hack anyway, stuff this info into the searchApp
                // object.
                console.log('results',results);
                var displayCategories = results.data.displayTree.unauthenticated.children;
                searchApp.usingNewGenomes = false;
                searchApp.usingNewFeatures = false;
                for(var k=0; k<displayCategories.length; k++) {
                    if(displayCategories[k].category == 'reference_genomes') {
                        displayCategories[k].category = 'genomes';
                        searchApp.usingNewGenomes = true;
                    }
                    if(displayCategories[k].category == 'genomeFeatures') {
                        displayCategories[k].category = 'features';
                        searchApp.usingNewFeatures = true;
                    }
                }
                console.log(searchApp);
                this.categoriesJSON = results.data;
                console.log('Using base config: ', results.data)
                deferred.resolve(results);
            });            
            
            return deferred.promise;
        }        
    };
});


searchApp.service('searchKBaseClientsService', function($q, $http, $rootScope) {
    return {
        getWorkspaceClient : function(token) {
            return new Workspace($rootScope.kb.ws_url, {token: token});
        },
        getNarrativeManager : function(token) {
            return new NarrativeManager({ws_url: $rootScope.kb.ws_url,
                                         nms_url: $rootScope.kb.nms_url},
                                         token);                                         
        }    
    };
});


/*
 *  This service houses the various options captured for Search, some of which
 *  are housed in local storage for persistence.
 */
searchApp.service('searchOptionsService', function searchOptionsService() {
    var genomesWorkspace = "KBasePublicGenomesV4";
    var searchGenomesWorkspace = "KBasePublicRichGenomesV4";
    var metagenomesWorkspace = "wilke:Data";

    var session = $.KBaseSessionSync.getKBaseSession();
    
    if (!session) {
        session = {token: null, user_id: null, name: null};
    }

    // Model data that is specific to each search instance
    var _sessionUserData = {
        "token": session.token,
        "user_id": session.user_id,
        "name": session.name,
        "selectAll": {},
        "selectedWorkspace": null,
        "viewType": "compact",
        "breadcrumbs": {},
        "displayWorkspaces": false,
        "set": {
            'genomes': true,
            'features': true,
            'metagenomes': true,
            'models': false,
            'models_fba': true,
            'models_media': false
        },
        "data_cart": {
            size: 0, 
            all: false,
            data: {},
            types: {
                'genomes': {all: false, size: 0, markers: {}},
                'features': {all: false, size: 0, markers: {}},
                'metagenomes': {all: false, size: 0, markers: {}},
                'models': {
                    size: 0,
                    subtypes: {
                        'models_fba': {all: false, size: 0, markers: {}},
                        'models_media': {all: false, size: 0, markers: {}}
                    }
                }
            }
        },
        "transfer_cart": {
            size: 0,
            items: {}                         
        },        
        "version": 0.6
    };
    
    // Model data that persists for all searches
    var _longtermUserData = {
        "workspaces": null,
        "version": 0.6
    };


    if (!sessionStorage.hasOwnProperty("searchUserState") || (!sessionStorage.searchUserState.version || sessionStorage.searchUserState.version < _sessionUserData.version)) {
        sessionStorage.setItem("searchUserState", JSON.stringify(_sessionUserData));
    }    

    for (var p in _sessionUserData) {
        if (_sessionUserData.hasOwnProperty(p) && !sessionStorage.searchUserState.hasOwnProperty(p)) {
            sessionStorage.searchUserState[p] = _sessionUserData[p];
        }    
    }

    if (!localStorage.hasOwnProperty("searchUserState") || (!localStorage.searchUserState.version || localStorage.searchUserState.version < _longtermUserData.version)) {
        localStorage.setItem("searchUserState", JSON.stringify(_longtermUserData));
    }    

    for (var p in _longtermUserData) {
        if (_longtermUserData.hasOwnProperty(p) && !localStorage.searchUserState.hasOwnProperty(p)) {
            localStorage.searchUserState[p] = _longtermUserData[p];
        }    
    }
    return {
        categoryInfo : {},
        categoryTemplates : {},
        categoryGroups : {},
        searchCategories : {},
        categoryRelationships : {},
        expandedCategories : { 'genomes': true,
                               'features': true,
                               'metagenomes': true,
                               'models_media': true,
                               'models_fba': true
                             },
        related: {},
        numPageLinks : 10,
        defaultSearchOptions : {
                                "general": {"itemsPerPage": 10},
                                "perCategory": {}
                               },    
        categoryCounts : {},
        searchOptions : this.defaultSearchOptions,                                          
        defaultMessage : "KBase is processing your request...",
        userState: {
                    "longterm": JSON.parse(localStorage.searchUserState),
                    "session": JSON.parse(sessionStorage.searchUserState)
                   },
        publicWorkspaces: {
                           "search_genome": searchGenomesWorkspace,
                           "genomes": genomesWorkspace,
                           "features": genomesWorkspace,
                           "metagenomes": metagenomesWorkspace
                          },
        landingPagePrefix: "/#/dataview/",
        iconMapping: {
            "metagenomes": "<span class='fa-stack'><i class='fa fa-circle fa-stack-2x' style='color: rgb(255, 193, 7);'></i><i class='icon fa-inverse fa-stack-1x icon-metagenome kb-data-icon-dnudge'></i></span>",
            "genomes": "<span class='fa-stack'><i class='fa fa-circle fa-stack-2x' style='color: rgb(63, 81, 181);'></i><i class='icon fa-inverse fa-stack-1x icon-genome kb-data-icon-dnudge'></i></span>",
            "features": "<span class='fa-stack'><i class='fa fa-circle fa-stack-2x' style='color: rgb(63, 81, 181);'></i><i class='icon fa-inverse fa-stack-1x icon-genome kb-data-icon-dnudge'></i></span>",
            "models_fba": "<span class='fa-stack'><i class='fa fa-circle fa-stack-2x' style='color: rgb(0, 96, 100);'></i><i class='icon fa-inverse fa-stack-1x icon-metabolism kb-data-icon-dnudge'></i></span>",
            "models_media": "<span class='fa-stack'><i class='fa fa-circle fa-stack-2x' style='color: rgb(244, 67, 54);'></i><i class='fa fa-inverse fa-stack-1x fa-flask'></i></span>",
            "models": "<span class='fa-stack'><i class='fa fa-circle fa-stack-2x' style='color: rgb(0, 96, 100);'></i><i class='icon fa-inverse fa-stack-1x icon-metabolism kb-data-icon-dnudge'></i></span>",
            "all": "<span class='fa-stack'><img id='logo' src='assets/navbar/images/kbase_logo.png' width='46'></span>"
        },        
        resultJSON : {},
        objectCopyInfo : null,
        resultsAvailable : false,
        countsAvailable : false,
        transferring: false,
        objectsTransferred: 0,
        transferSize: 0,
        selectedCategory : null,
        pageLinksRange : [],
        facets : null,
        active_facets: {},        
        active_sorts: {},
        open_facet_panels: {},
        data_tabs: {},
        duplicates: {},

        reset : function() {
            this.categoryCounts = {};
            this.resultJSON = {};
            this.objectCopyInfo = null;
            this.resultsAvailable = false;
            this.countsAvailable = false;
            this.transferring = false;
            this.objectsTransferred = 0;
            this.transferSize = 0;
            this.selectedCategory = null;
            this.pageLinksRange = [];
            this.facets = null;
            this.active_facets = {};
            this.active_sorts = {};
            this.open_facet_panels = {};
            this.data_tabs = {};
            this.duplicates = {};
            
            this.searchOptions = this.defaultSearchOptions;                                          

            this.userState = { 
                "longterm": JSON.parse(localStorage.searchUserState),
                "session": JSON.parse(sessionStorage.searchUserState)
            };
        }
    };
});


/* Filters */

/*
searchApp.filter('highlight', function($sce) {
    return function(input, tokens) {
        if (tokens.length == 0 || tokens.length == 1 && tokens[0] == '*') {
            return input;
        }

        if (input) {    
            console.log(tokens);
            var regex = new RegExp('(' + tokens.join('|') + ')', 'ig');
            console.log(regex.string);
            console.log(input.replace(regex, '<span class="search-result-highlight">$&</span>'));
            return $sce.trustAsHtml(input.replace(regex, '<span class="search-result-highlight">$&</span>'));
        }
        
        return input;
    };
});
*/

/* Controllers */

// This controller is responsible for the Search Data Nav and connects to the Search view controller
searchApp.controller('searchBarController', function searchBarCtrl($rootScope, $scope, $state) {
    $scope.$on('queryChange', function(event, query) {
        $scope.query = query;
    });

    $scope.newSearch = function () {
        if ($scope.query && $scope.query.length > 0) {
            //$rootScope.$state.go('search', {q: $scope.query});
            $state.go('search', {q: $scope.query});
        }
        else {
            //$rootScope.$state.go('search', {q: "*"});
            $state.go('search', {q: "*"});        
        }
    };    
});


/*
 *  The main Search controller that is responsible for content inside the Search view.
 */
searchApp.controller('searchController', function searchCtrl($rootScope, $scope, $q, $timeout, $http, $state, $stateParams, searchCategoryLoadService, searchOptionsService, searchKBaseClientsService, require) {
    $scope.options = searchOptionsService;
    $scope.workspace_service;
    $scope.narrative_manager;

    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
        if (toState.name === "search") {
            //console.log($scope.options.userState);
            //console.log("state change to search");
            $scope.startSearch();      
        }  
    });

    // This block of code will never be executed because of scoping, guessing nobody checked this
    // when they modified the code.
    /*
    postal.channel('session').subscribe('login.success', function (session) {        
        $state.go('search');
        $scope.$apply();
    });
    
    postal.channel('session').subscribe('logout.success', function (session) {        
        $state.go('search');
        $scope.$apply();
    });    
    */

    $scope.$bus.subscribe({
        channel: 'session',
        topic: 'login.success',
        callback: function(sessionObject) {
            var session = sessionObject.getKBaseSession();
            $scope.options.userState.session.token = session.token;
            $scope.options.userState.session.user_id = session.token;
            $scope.options.userState.session.name = session.token;
        }
    });

    /*
     * disable -- logout now always goes to /login.
    
    $scope.$bus.subscribe({
        channel: 'session',
        topic: 'logout.success',
        callback: function() {
            // by definition, there is no session available after logout.
            $scope.options.userState.session.token = null;
            $scope.options.userState.session.user_id = null;
            $scope.options.userState.session.name = null;
            // It was my mistake (eap) to pass an empty session object
            // in the logout.success message. 
            //$scope.options.userState.session.token = session.token;
            //$scope.options.userState.session.user_id = session.user_id;
            //$scope.options.userState.session.name = session.name;
            $state.go('search');
        }
    });
     */


    $scope.login = function() {
        postal.channel('loginwidget').publish('login.prompt');
    };


    $scope.logout = function() {
        $stateParams = {};
        postal.channel('session').publish('logout.request');
    };

    
    $scope.setNavbarTitle = function(title) {
        require(['kb.widget.navbar'], function (Navbar) {
            $scope.navbar = Navbar;
            $scope.navbar.clearMenu();
            $scope.navbar.addDefaultMenu({search: false});
            $scope.navbar.clearTitle();
            $scope.navbar.clearButtons();

            $scope.navbar.setTitle(title);
                        
            //Navbar.addButton("Help");
            //Navbar.addHelpMenuItem({title: "Search User Guide"});
        });
    };
    

    $scope.saveUserState = function() {
        localStorage.setItem("searchUserState", JSON.stringify($scope.options.userState.longterm));
        sessionStorage.setItem("searchUserState", JSON.stringify($scope.options.userState.session));
    };


    $scope.loadCategories = function() {
        var flattenCategories = function(resource) {
            if (resource.hasOwnProperty("category") && $scope.options.categoryInfo.categories.hasOwnProperty(resource.category)) {
                $scope.options.searchCategories[resource.category] = {"category": resource.category, "label": resource.label};
            }            
        
            if (resource.hasOwnProperty("children")) {
                for (var i = 0; i < resource.children.length; i++) {
                    flattenCategories(resource.children[i]);
                }    
            }
        };

        for (var p in $scope.options.categoryInfo.displayTree) {
            if ($scope.options.categoryInfo.displayTree.hasOwnProperty(p)) {
                flattenCategories($scope.options.categoryInfo.displayTree[p]);
            }
        }                 

        var recordRelationships = function(node, nodeParent) {
            if (node.hasOwnProperty("category")) {
                $scope.options.categoryRelationships[node.category] = {"parent": nodeParent, "children": []};    
            
                if (node.hasOwnProperty("children")) {
                    for (var i = 0; i < node.children.length; i++) {
                        if (node.children[i].hasOwnProperty("category")) {
                            $scope.options.categoryRelationships[node.category].children.push(node.children[i].category);
                    
                            recordRelationships(node.children[i], node.category);
                        }
                    }
                }
            }
            else {
                if (node.hasOwnProperty("children")) {
                    for (var i = 0; i < node.children.length; i++) {
                        recordRelationships(node.children[i], nodeParent);
                    }
                }
            }
        };

        recordRelationships($scope.options.categoryInfo.displayTree['unauthenticated'], null);

        var isRelated = function(a, b) {
            var splits = [a.split("_"), b.split("_")];
        
            if (splits[0][0] !== splits[1][0]) {
                return false;
            }

            // test to see if a is an ancestor of b or just siblings
            if (splits[0].length < splits[1].length) {
                if (splits[0].length === 1) {
                    return true;
                }
                
                for (var i = 0; i < splits[0].length; i++) {
                    if (splits[0][i] !== splits[1][i]) {
                        return false;
                    }
                }
                return true;
            }
            // test to see if b is an ancestor of a or just siblings
            else {
                if (splits[1].length === 1) {
                    return true;
                }
                
                for (var i = 0; i < splits[1].length; i++) {
                    if (splits[1][i] !== splits[0][i]) {
                        return false;
                    }
                }
                return true;
            }
        };
        
        
        for (var p in $scope.options.categoryRelationships) {
            if ($scope.options.categoryRelationships.hasOwnProperty(p)) {
                $scope.options.related[p] = {};
                
                for (var psub in $scope.options.categoryRelationships) {
                    $scope.options.related[p][psub] = isRelated(p, psub);          
                }
            }
        }
        
        $scope.options.templates = {};
        for (var p in $scope.options.searchCategories) {
            if ($scope.options.searchCategories.hasOwnProperty(p) && p !== "models") {
                $scope.options.templates[p] = {};
                $scope.options.templates[p]["root"] = "views/search/searchCategory.html";
                $scope.options.templates[p]["header"] = "views/search/categories/" + p + "/" + p + "_header.html";
                $scope.options.templates[p]["rows"] = "views/search/categories/" + p + "/" + p + "_rows.html";
                $scope.options.templates[p]["expanded"] = "views/search/categories/" + p + "/" + p + "_expanded.html";
            }
            if ($scope.options.searchCategories.hasOwnProperty(p) && p === "models") {
                $scope.options.templates[p] = {};
                $scope.options.templates[p]["root"] = "views/search/categories/models.html";
            }
        }

        // Hide Metagenomics from search. This has to be done in category service
        // https://kbase.us/services/search/categories
        delete $scope.options.searchCategories["metagenomes"];
        //delete $scope.options.searchCategories["features"];
        //console.log($scope.options.related);
        //console.log($scope.options.searchCategories);
    };


    $scope.sanitizeFacets = function(input_facets) {
        var encodedFacets = "";
        var facets = input_facets.split(",");
        var currentFacet;

        for (var i = 0; i < facets.length; i++) {
            currentFacet = facets[i].split(":");
            
            if (currentFacet[1].indexOf('"') < 0) {
                encodedFacets += currentFacet[0] + ":" + '"' + currentFacet[1] + '",';
            }
            else {
                encodedFacets += currentFacet[0] + ":" + currentFacet[1] + ',';            
            }
        }

        //console.log(encodedFacets);
        return encodedFacets.substring(0,encodedFacets.length-1);
    };



    $scope.getCount = function(options, category) {
    
        //console.log("getCount");
        //console.log([options, category]);
        var categoryQuery = category;
        if(category == 'genomes' && searchApp.usingNewGenomes) {
            categoryQuery = 'reference_genomes';
        }
        if(category == 'features' && searchApp.usingNewFeatures) {
            categoryQuery = 'genomeFeatures';
        }

        var queryOptions = {};

        angular.copy(options, queryOptions);
        
        queryOptions["page"] = 1;
        queryOptions["itemsPerPage"] = 0;
        queryOptions["category"] = categoryQuery;


        //console.log("getCount : " + JSON.stringify(queryOptions));

        if (queryOptions.hasOwnProperty("facets") && queryOptions["facets"]) {
            queryOptions["facets"] = $scope.sanitizeFacets(options["facets"]);
        }

        if (!$scope.options.userState.session.hasOwnProperty("ajax_requests") || !$scope.options.userState.session.ajax_requests) {
            $scope.options.userState.session.ajax_requests = [];
        }        

        $scope.options.userState.session.ajax_requests.push(
            $http({method: 'GET', 
                   url: $rootScope.kb.search_url + "getResults",
                   params: queryOptions,      
                   responseType: 'json'
                  }).then(function (jsonResult) {
                      if (jsonResult.data.totalResults === undefined) {
                          $scope.options.categoryCounts[category] = 0;
                      }
                      else {
                          $scope.options.categoryCounts[category] = jsonResult.data.totalResults;                  
                      }
                      
                      if ($scope.options.selectedCategory && category === $scope.options.selectedCategory) {                      
                          countsAvailable = true;
                      }
                      //console.log($scope.options.categoryCounts);
                  }, function (error) {
                      console.log(error);
                      $scope.options.categoryCounts[category] = 0;
                  }, function (update) {
                      console.log(update);
                  })
        );
    };
    
    $scope.getTotalCount = function() {
        var sum = 0;
        for (var p in $scope.options.categoryCounts) {
            if ($scope.options.categoryCounts.hasOwnProperty(p)) {
                sum += $scope.options.categoryCounts[p];
            }
        }
        
        return sum;
    };
    
    $scope.getResults = function(category, options) {
        //console.log($scope.options);

        // Note- hate to do this, but duplicates code.  Fix in both places.
        function processQuery(query) {
            var newQuery = '*'
            if (query) {
                query = query.trim();
                if (query.length == 0) {
                    newQuery = '*';
                } else if (query.indexOf('"') < 0) {
                    var parts = query.split(/\s+/);
                    for (var i in parts)
                        if (parts[i].indexOf('*', parts[i].length - 1) < 0)
                            parts[i] = parts[i] + '*';
                    newQuery = parts.join(' ');
                }
            }
            return newQuery;
        }


        var queryOptions = {};

        if (!$scope.options.userState.session.hasOwnProperty("ajax_requests") || !$scope.options.userState.session.ajax_requests) {
            $scope.options.userState.session.ajax_requests = [];
        }
        
        if (category === null || category === undefined) {
            queryOptions = {'q': processQuery(options.general.q)};

            $("#loading_message_text").html(options.defaultMessage);
            $.blockUI({message: $("#loading_message")});
            
            for (var p in $scope.options.searchCategories) {
                if ($scope.options.searchCategories.hasOwnProperty(p) && $scope.options.searchCategories[p].category !== null) {
                    if ($scope.options.searchCategories[p].category === $scope.options.selectedCategory && options.perCategory[p].hasOwnProperty("facets") && options.perCategory[p]["facets"]) {
                        queryOptions["facets"] = $scope.sanitizeFacets(options.perCategory[p]["facets"]);
                    }
                    
                    $scope.getCount(queryOptions, $scope.options.searchCategories[p].category);            
                    queryOptions = {'q': processQuery(options.general.q)};
                }
                else {
                    $scope.options.categoryCounts[category] = 0;
                }
            }
    
            $scope.options.countsAvailable = true;
            // here we are waiting for all the ajax count calls to complete before unblocking the UI            
            $q.all($scope.options.userState.session.ajax_requests).then(function() {
                $.unblockUI();
                $scope.options.userState.session.ajax_requests = [];
                $scope.searchActive = false;
                //console.log($scope.options.categoryCounts);
            });
            
            return;
        }

        var categoryQuery = category;
        if(category == 'genomes' && searchApp.usingNewGenomes) {
            categoryQuery = 'reference_genomes';
        }
        if(category == 'features' && searchApp.usingNewFeatures) {
            categoryQuery = 'genomeFeatures';
        }

        queryOptions.category = categoryQuery;
        for (var prop in options) {        
            if (prop === "general") {
                for (var gen_prop in options.general) {
                    if (options.general.hasOwnProperty(gen_prop)) {
                        if(gen_prop=='q') {
                            queryOptions[gen_prop] = processQuery(options.general[gen_prop]);
                        } else {
                            queryOptions[gen_prop] = options.general[gen_prop];
                        }
                    }
                }
        
                if (queryOptions.hasOwnProperty("token")) {
                    delete queryOptions.token;
                }
            }        
            else if (prop === "perCategory") {
                for (var cat_prop in options.perCategory[category]) {
                    if (options.perCategory[category].hasOwnProperty(cat_prop)) {
                        queryOptions[cat_prop] = options.perCategory[category][cat_prop];
                    }
                }
            }    
        }

        if (queryOptions.hasOwnProperty("facets") && queryOptions["facets"]) {
            queryOptions["facets"] = $scope.sanitizeFacets(queryOptions["facets"]);
        }

        $("#loading_message_text").html(options.defaultMessage);
        $.blockUI({message: $("#loading_message")});

        console.log("getResults : " + JSON.stringify(queryOptions));

        $http({method: 'GET', 
               url: $rootScope.kb.search_url + "getResults",
               params: queryOptions,      
               responseType: 'json'
              }).then(function (jsonResult) {
                  var ws_global_id_match = /kb\|ws\.(\d+)\.obj\.(\d+)(?:\.ver\.(\d+))?/g,
                      ws_global_regex_matches = [],
                      ws_global_id_groups = [];
              
                  for (var i = 0; i < jsonResult.data.items.length; i++) {
                      var record = jsonResult.data.items[i];
                      record.position = (jsonResult.data.currentPage - 1) * jsonResult.data.itemsPerPage + i + 1;

                      // it is one of the new types, so handle it in the new fashion
                      if (record.hasOwnProperty('ws_ref')) {
                         record.object_ref = record.ws_ref;
                         record.row_id = record.ws_ref;
                         if (record.hasOwnProperty("feature_id")) {
                             record.row_id = record.feature_id.replace(/\/\||\./g,"_");
                         }
                         else if (record.hasOwnProperty("genome_id")) {
                             record.row_id = record.genome_id.replace(/\/\||\./g,"_");
                         }
                         //object_id is used to name things, so we should just set that to the row_id
                         record.object_id = record.row_id;
                      } else {
                         if (record.hasOwnProperty("object_id")) {
                              // detect object_id with kb|ws.<wsid>.obj.<objid>.ver.<version> with <wsid>/<objid>/<version>
                              ws_global_regex_matches = record.object_id.match(ws_global_id_match);
                              if(ws_global_regex_matches) {
                                  if (ws_global_regex_matches.length == 1) {
                                      ws_global_id_groups =  record.object_id.split('.');
                                      record.object_ref = ws_global_id_groups[1] + "/" + ws_global_id_groups[3];
                                      
                                      // check to see if a version was included, if so, add to ref string
                                      if (ws_global_id_groups.length == 6) {
                                          record.object_ref += "/" + ws_global_id_groups[5];
                                      }
                                  }
                                  else {
                                      console.log("Unexpected format for object_id, found " + record["object_id"]);
                                  }
                              }
                              
                              // set the row id using the object reference string, replace all '/' with '_'
                              record.row_id = record.object_ref.replace(/\//g,"_");
                          }
                          else {
                              if (record.hasOwnProperty("feature_id")) {
                                  record.row_id = record.feature_id.replace(/\/\||\./g,"_");
                                  //console.log(jsonResult.data.items[i].row_id);
                              }
                              else if (record.hasOwnProperty("genome_id")) {
                                  record.row_id = record.genome_id.replace(/\/\||\./g,"_");
                              }
                          }
                      }
                      console.log('record', i, record);

                      if (record.hasOwnProperty("taxonomy")) {
                          record.taxonomy = record.taxonomy.join('; ');
                      }
                      if (record.hasOwnProperty("aliases")) {
                          record.aliases = record.aliases.join('; ');
                      }
                  }

                  $scope.options.resultJSON = jsonResult.data;
                  $scope.options.resultsAvailable = true;
                  $scope.options.pageLinksRange = [];
              
                  $scope.options.facets = null;
              
                  if ($scope.options.resultJSON.hasOwnProperty('facets')) {
                      $scope.options.facets = [];

                      for (var p in $scope.options.resultJSON.facets) {
                          if ($scope.options.resultJSON.facets.hasOwnProperty(p)) {
                              var facet_options = [];
                              var count = 0;
                      
                              for (var i = 0; i < $scope.options.resultJSON.facets[p].length - 1; i += 2) {
                                  facet_options.push({key: $scope.options.resultJSON.facets[p][i], value: $scope.options.resultJSON.facets[p][i+1]});                              
                                  count += $scope.options.resultJSON.facets[p][i+1];
                              }
                              
                              if (count > 0) {
                                  $scope.options.facets.push({key: p, value: facet_options, count: count});
                              }
                          }
                      }
                  }
              
                  var position = $scope.options.resultJSON.currentPage % $scope.options.numPageLinks;
                  var start;
              
                  if (position === 0) {
                      start = $scope.options.resultJSON.currentPage - $scope.options.numPageLinks + 1;                  
                  }
                  else {
                      start = $scope.options.resultJSON.currentPage - position + 1;                  
                  }
              
                  var end = start + $scope.options.numPageLinks;

                  for (var p = start; p < end && (p - 1) * $scope.options.resultJSON.itemsPerPage < $scope.options.resultJSON.totalResults; p++) {                      
                      $scope.options.pageLinksRange.push(p);                      
                  }                  

                  if ($scope.options.resultJSON.items.length > 0) {
                      $scope.options.currentItemRange = $scope.options.resultJSON.items[0].position + "-" + $scope.options.resultJSON.items[$scope.options.resultJSON.items.length - 1].position;
                  }
                  else {
                      console.log($scope.options);
                  }

                  $scope.options.currentURL = $state.href("search", $stateParams, {absolute: true});
                  
                  console.log($scope.options.resultJSON);     
                  $.unblockUI();
              }, function (error) {
                  console.log("getResults threw an error!");
                  console.log(error);
                  $scope.options.resultsAvailable = false;
                  $.unblockUI();
              }, function (update) {
                  console.log(update);
              });
    };


    $scope.newSearch = function () {
        if ($scope.options.searchOptions.general.q && $scope.options.searchOptions.general.q.length > 0) {
            $scope.saveUserState();

            // if we are in the category view, update the individual count
            if ($scope.options.selectedCategory) {
                $scope.getCount({q: $scope.options.searchOptions.general.q}, $scope.options.selectedCategory);        
                $state.go('search', {q: $scope.options.searchOptions.general.q, category: $scope.options.selectedCategory, page: 1, sort: null, facets: null});
            }
            else {
                $state.go('search', {q: $scope.options.searchOptions.general.q});            
            }
        }
    };    

    
    $scope.startSearch = function () {
        $scope.searchActive = true;
        $scope.options.tokens = [];
        
        //console.log("Starting search with : " + $stateParams.q);
        //console.log($stateParams);

        var init = function () {
            // in here we initialize anything we would want to reset on starting a new search
            return searchCategoryLoadService.getCategoryInfo().then(function(results) {
                $scope.options.categoryInfo = results.data;
                $scope.loadCategories();
            });
        };

        var captureState = function () {
            if ($scope.options.searchOptions === undefined) {
                $scope.options.reset();
            }

            // apply query string
            if ($stateParams.q !== undefined && $stateParams.q !== null && $stateParams.q !== '') {
                $scope.options.searchOptions.general.q = $stateParams.q;
                $scope.options.tokens = $stateParams.q.split(" ");
                //console.log($scope.options.tokens);
            }
            else { // search view reached without a query, reset
                $scope.options.reset();
            }            

            // apply category selection
            if ($stateParams.category !== null && $stateParams.category in $scope.options.searchCategories) {
                $scope.options.selectedCategory = $stateParams.category;                

                $scope.setNavbarTitle("Search <span class='search-navbar-title'>" + 
                                      $scope.options.iconMapping[$scope.options.selectedCategory] + 
                                      $scope.options.searchCategories[$stateParams.category]["label"] + "</span>");

                if ($scope.options.selectedCategory && !$scope.options.searchOptions.perCategory.hasOwnProperty($scope.options.selectedCategory)) {
                    $scope.options.searchOptions.perCategory[$scope.options.selectedCategory] = {"page": 1};
                }
                
                if ($stateParams.page !== undefined && $stateParams.page !== null) {
                    $scope.setCurrentPage($stateParams.page, false);
                }
                else {
                    $scope.setCurrentPage(1, false);
                }

                if ($stateParams.itemsPerPage !== null && $stateParams.itemsPerPage > 0 && $stateParams.itemsPerPage <= 100) {
                    $scope.options.searchOptions.general.itemsPerPage = $stateParams.itemsPerPage;
                }
                else {
                    $scope.options.searchOptions.general.itemsPerPage = 10;                
                }
            }
            else {
                $scope.setNavbarTitle("Search <span class='search-navbar-title'>All Data Categories<span>");                    
                $scope.options.reset();
            }            
    
            // apply facets
            if ($stateParams.facets !== null) {
                  // clear any cached facets
                  delete $scope.options.searchOptions.perCategory[$scope.options.selectedCategory].facets;
                  $scope.options.active_facets[$scope.options.selectedCategory] = {};
                  
                  var facetSplit = $stateParams.facets.split(",");
                  
                  var facet_keyval = [];

                  for (var i = 0; i < facetSplit.length; i++) {
                      facet_keyval = facetSplit[i].split(":");                      
                      
                      $scope.addFacet(facet_keyval[0],facet_keyval[1].replace("*",",").replace('^',':'), false);
                  }                
            }
            else {
                $scope.options.facets = null;
                
                if ($scope.options.selectedCategory && $scope.options.searchOptions.perCategory[$scope.options.selectedCategory].hasOwnProperty("facets")) {
                    delete $scope.options.searchOptions.perCategory[$scope.options.selectedCategory].facets;
                    $scope.options.active_facets[$scope.options.selectedCategory] = {};
                }
            }

            // apply sorting
            if ($stateParams.sort !== null) {
                // clear any sort cached
                $scope.options.searchOptions.perCategory[$scope.options.selectedCategory].sort = "";
                $scope.options.active_sorts[$scope.options.selectedCategory] = {count: 0, sorts: {}};
            
                var sortSplit = $stateParams.sort.split(",");
                var sort_keyval = [];                
                
                for (var i = 0; i < sortSplit.length; i++) {
                    sort_keyval = sortSplit[i].split(" ");
                    
                    $scope.addSort($scope.options.selectedCategory, sort_keyval[0], sort_keyval[1], false);
                }                
            }
            else {
                $scope.options.active_sorts[$scope.options.selectedCategory] = {count: 0, sorts: {}};
                
                if ($scope.options.selectedCategory && $scope.options.searchOptions.perCategory[$scope.options.selectedCategory].hasOwnProperty("sort")) {
                    delete $scope.options.searchOptions.perCategory[$scope.options.selectedCategory].sort;
                }
            }
        };


        if (!$scope.options.categoryInfo.hasOwnProperty("displayTree")) {
            init().then(function () {
                captureState();
                $scope.getResults(null, $scope.options.searchOptions);

                $scope.getResults($scope.options.selectedCategory, $scope.options.searchOptions);        
            });
        }
        else {
            captureState();
            //console.log("No category chosen");
            
            var queryOptions = {q: $scope.options.searchOptions.general.q};

            if ($scope.options.selectedCategory) {            
                if ($scope.options.searchOptions.perCategory[$scope.options.selectedCategory].hasOwnProperty("facets")) {
                    queryOptions.facets = $scope.options.searchOptions.perCategory[$scope.options.selectedCategory].facets;
                }                
            
                if ($scope.options.searchOptions.perCategory[$scope.options.selectedCategory].hasOwnProperty("sort")) {
                    queryOptions.sort = $scope.options.searchOptions.perCategory[$scope.options.selectedCategory].sort;
                }            
            }
            
            if ($scope.options.selectedCategory) {
                $scope.getCount(queryOptions, $scope.options.selectedCategory);
            }
            
            $scope.getResults($scope.options.selectedCategory, $scope.options.searchOptions);        
        }
    };
    
    $scope.selectCategory = function(value) {
        $scope.options.selectedCategory = value;
        
        //console.log("Selected category : " + value);
        $scope.saveUserState();
        
        if (value === null || value === 'null') {
            $scope.options.reset();
            $state.go("search", {category: null, page: null, itemsPerPage: null, facets: null, sort: null});
        }            
        else {
            if (!$scope.options.searchOptions.perCategory.hasOwnProperty(value)) {
                $scope.options.searchOptions.perCategory[value] = {"page": 1};
            }
            
            $state.go("search", {category: $scope.options.selectedCategory, itemsPerPage: null, facets: null, sort: null});
        }
    };


    $scope.isInActiveCategoryTree = function(value) {
        return $scope.options.related[value][$scope.options.selectedCategory];
    };


    $scope.removeSearchFilter = function(category, type, name, value) {
        //console.log("before remove");
        //console.log($scope.options.searchOptions.perCategory[category][type]);

        // e.g. filters=domain:bacteria,domain:archea,complete:true
        if ($scope.options.searchOptions.perCategory[category].hasOwnProperty(type)) {
            var oldFilter;
            
            if (type === "sort") {
                oldFilter = $scope.options.searchOptions.perCategory[category][type].indexOf(name);
            }
            else if (type === "facets") {
                oldFilter = $scope.options.searchOptions.perCategory[category][type].indexOf(name + ":" + value.replace(",","*").replace(":","^"));
            }
        
            var nextComma = $scope.options.searchOptions.perCategory[category][type].indexOf(",");
    
            if (oldFilter > -1) {
            
                if (oldFilter === 0 && nextComma < 0) {
                    // only one filter, go back to empty string
                    $scope.options.searchOptions.perCategory[category][type] = "";
                }
                else if (oldFilter === 0 && nextComma > oldFilter) {
                    // remove the beginning of the string to the comma
                    $scope.options.searchOptions.perCategory[category][type] = $scope.options.searchOptions.perCategory[category][type].substring(nextComma + 1,$scope.options.searchOptions.perCategory[category][type].length);                                
                }
                else if (oldFilter > 0) {
                    // must be more than one sort option, now get the comma after oldFacet
                    nextComma = $scope.options.searchOptions.perCategory[category][type].indexOf(",", oldFilter);
            
                    // we need to cut off the end of the string before the last comma
                    if (nextComma < 0) {
                        $scope.options.searchOptions.perCategory[category][type] = $scope.options.searchOptions.perCategory[category][type].substring(0,oldFilter - 1);
                    }
                    // we are cutting out the middle of the string
                    else {
                        $scope.options.searchOptions.perCategory[category][type] = $scope.options.searchOptions.perCategory[category][type].substring(0,oldFilter - 1) +
                            $scope.options.searchOptions.perCategory[category][type].substring(nextComma, $scope.options.searchOptions.perCategory[category][type].length);
                    }
                }
            }

            //console.log("after remove");
            //console.log($scope.options.searchOptions.perCategory[category][type]);
            //console.log($scope.options.searchOptions.perCategory[category][type].length);
    
            if ($scope.options.searchOptions.perCategory[category][type].length === 0) {
                delete $scope.options.searchOptions.perCategory[category][type];
            }            
        }    
    };


    $scope.setResultsPerPage = function (value) {
        $scope.options.searchOptions.general.itemsPerPage = parseInt(value);

        $scope.saveUserState();
    
        //reset the page to 1
        $state.go("search", {itemsPerPage: $scope.options.searchOptions.general.itemsPerPage, page: 1});
    };


    $scope.addSort = function (category, name, direction, searchAgain) {    
        if (!$scope.options.searchOptions.perCategory[category].hasOwnProperty("sort")) {
            $scope.options.searchOptions.perCategory[category].sort = name + " " + direction;
        }
        else {
            // attempt to remove any old sorts of this name before adding the new one
            $scope.removeSort(category, name, false);

            // sort not initialized after removal of last sort
            if (!$scope.options.searchOptions.perCategory[category].hasOwnProperty("sort")) {
                $scope.options.searchOptions.perCategory[category].sort = name + " " + direction;
            }
            // another sort exists
            else if ($scope.options.searchOptions.perCategory[category].sort.length > 0) {
                $scope.options.searchOptions.perCategory[category].sort += "," + name + " " + direction;
            }
            // sort was initialized, but empty
            else {
                $scope.options.searchOptions.perCategory[category].sort += name + " " + direction;
            }
        }
        
        // add this as the last sort type
        $scope.options.active_sorts[category].count = $scope.options.active_sorts[category].count + 1;
        $scope.options.active_sorts[category].sorts[name] = {order: $scope.options.active_sorts[category].count, direction: direction};

        if (searchAgain === undefined || searchAgain === true) {
            $scope.saveUserState();        
            $state.go("search", {sort: $scope.options.searchOptions.perCategory[category].sort, page: 1});
        }
    };


    $scope.removeSort = function (category, name, searchAgain) {
        $scope.removeSearchFilter(category, "sort", name, null);

        if ($scope.options.active_sorts.hasOwnProperty(category) && $scope.options.active_sorts[category].sorts.hasOwnProperty(name)) {
            // if this sort was not the last ordered sort, adjust the order of other sorts
            if ($scope.options.active_sorts[category].sorts.hasOwnProperty(name) && $scope.options.active_sorts[category].count - 1 > $scope.options.active_sorts[category].sorts[name].order) {
                for (var s in $scope.options.active_sorts[category].sorts) {
                    if ($scope.options.active_sorts[category].sorts.hasOwnProperty(s) && $scope.options.active_sorts[category].sorts[s].order > $scope.options.active_sorts[category].sorts[name].order) {
                        $scope.options.active_sorts[category].sorts[s].order -= 1;
                    }
                }
            }

            $scope.options.active_sorts[category].count -= 1;
            delete $scope.options.active_sorts[category].sorts[name];
        }
        
        if (searchAgain === undefined || searchAgain === true) {
            $scope.saveUserState();
            $state.go("search", {sort: $scope.options.searchOptions.perCategory[category].sort, page: 1});
        }
    };


    $scope.setCurrentPage = function (page, searchAgain) {
        try {
            $scope.options.searchOptions.perCategory[$scope.options.selectedCategory].page = parseInt(page);
        }
        catch(e) {
            $scope.options.searchOptions.perCategory[$scope.options.selectedCategory] = {'page': parseInt(page)};
        }

        $scope.saveUserState();
        
        if (searchAgain === undefined || searchAgain === true) {
            $state.go("search", {page: $scope.options.searchOptions.perCategory[$scope.options.selectedCategory].page});
        }
    };
    

    $scope.toggleFacet = function (name, value, checked) {
        // need to reset the page when a facet changes
        $scope.options.searchOptions.perCategory[$scope.options.selectedCategory].page = 1;

        if (checked) {
            $scope.removeFacet(name, value);
        }
        else {
            $scope.addFacet(name, value, true);
        }
        
        $scope.toggleFacetPanel(name);                
    };


    $scope.toggleFacetPanel = function (key) {
        if (!$scope.options.open_facet_panels.hasOwnProperty($scope.options.selectedCategory)) {
            $scope.options.open_facet_panels[$scope.options.selectedCategory] = {};
            $scope.options.open_facet_panels[$scope.options.selectedCategory][key] = true;
        }
        else if (!$scope.options.open_facet_panels[$scope.options.selectedCategory].hasOwnProperty(key)) {
            $scope.options.open_facet_panels[$scope.options.selectedCategory][key] = true;
        }
        else if ($scope.options.open_facet_panels[$scope.options.selectedCategory][key] === false) {
            $scope.options.open_facet_panels[$scope.options.selectedCategory][key] = true;        
        }
        else {
            $scope.options.open_facet_panels[$scope.options.selectedCategory][key] = false;                
        }
    };

    $scope.isFacetPanelCollapsed = function (key) {
        return !angular.element("#" + key + "_panel").hasClass("in");
    };

    $scope.addFacet = function (name, value, searchAgain) {  
        //console.log([name, value]);
        
        if (!$scope.options.searchOptions.perCategory[$scope.options.selectedCategory].hasOwnProperty("facets")) {
            $scope.options.searchOptions.perCategory[$scope.options.selectedCategory].facets = name + ":" + value.replace(",","*").replace(":","^");
        }
        else {
            $scope.options.searchOptions.perCategory[$scope.options.selectedCategory].facets += "," + name + ":" + value.replace(",","*").replace(":","^");        
        }        
    
        if (!$scope.options.active_facets.hasOwnProperty($scope.options.selectedCategory)) {        
            $scope.options.active_facets[$scope.options.selectedCategory] = {};
        }

        if (!$scope.options.active_facets[$scope.options.selectedCategory].hasOwnProperty(name)) {
            $scope.options.active_facets[$scope.options.selectedCategory][name] = {};        
        }
        
        $scope.options.active_facets[$scope.options.selectedCategory][name][value] = true;        

        // Note- hate to do this, but duplicates code.  Fix in both places.
        function processQuery(query) {
            var newQuery = '*'
            if (query) {
                query = query.trim();
                if (query.length == 0) {
                    newQuery = '*';
                } else if (query.indexOf('"') < 0) {
                    var parts = query.split(/\s+/);
                    for (var i in parts)
                        if (parts[i].indexOf('*', parts[i].length - 1) < 0)
                            parts[i] = parts[i] + '*';
                    newQuery = parts.join(' ');
                }
            }
            return newQuery;
        }

        if (searchAgain === undefined || searchAgain === true) {
            $scope.getCount({q: processQuery($scope.options.searchOptions.general.q), facets: $scope.options.searchOptions.perCategory[$scope.options.selectedCategory].facets}, $scope.options.selectedCategory);        
            $state.go("search", {category: $scope.options.selectedCategory, facets: $scope.options.searchOptions.perCategory[$scope.options.selectedCategory].facets, page: 1});
        }
    };


    $scope.removeFacet = function (name, value, searchAgain) {
        $scope.removeSearchFilter($scope.options.selectedCategory, "facets", name, value);
                
        delete $scope.options.active_facets[$scope.options.selectedCategory][name][value];
        
        if ($.isEmptyObject($scope.options.active_facets[$scope.options.selectedCategory][name])) {
            delete $scope.options.active_facets[$scope.options.selectedCategory][name];
        }
    
        if (!$scope.options.searchOptions.perCategory[$scope.options.selectedCategory].hasOwnProperty("facets")) {
            $scope.options.active_facets[$scope.options.selectedCategory] = {};
        }

        if (searchAgain === undefined || searchAgain === true) {
            $scope.getCount({q: $scope.options.searchOptions.general.q, facets: $scope.options.searchOptions.perCategory[$scope.options.selectedCategory].facets}, $scope.options.selectedCategory);        
            $state.go("search", {category: $scope.options.selectedCategory, facets: $scope.options.searchOptions.perCategory[$scope.options.selectedCategory].facets, page: 1});
        }
    };


    $scope.removeAllFacets = function () {
        var changed = false;
    
        for (var name in $scope.options.active_facets[$scope.options.selectedCategory]) {
            //console.log(name);
        
            if ($scope.options.active_facets[$scope.options.selectedCategory].hasOwnProperty(name)) {
                //console.log(name);
                for (var value in $scope.options.active_facets[$scope.options.selectedCategory][name]) {
                    //console.log(value);
                    if ($scope.options.active_facets[$scope.options.selectedCategory][name].hasOwnProperty(value)) {
                        //console.log(value);
                        $scope.removeSearchFilter($scope.options.selectedCategory, "facets", name, value);
                        changed = true;
                    }
                }
                delete $scope.options.active_facets[$scope.options.selectedCategory][name];

                if (!$scope.options.searchOptions.perCategory[$scope.options.selectedCategory].hasOwnProperty("facets")) {
                    $scope.options.active_facets[$scope.options.selectedCategory] = {};
                }
            }            
        }
        
        if (changed) {
            $scope.getCount({q: $scope.options.searchOptions.general.q, facets: $scope.options.searchOptions.perCategory[$scope.options.selectedCategory].facets}, $scope.options.selectedCategory);        
            $state.go("search", {category: $scope.options.selectedCategory, facets: $scope.options.searchOptions.perCategory[$scope.options.selectedCategory].facets, page: 1});
        }
    };


    $scope.setView = function (type) {
        //console.log("Setting " + type);
        $scope.options.userState.session.viewType = type;
    };


    $scope.listWorkspaces = function() {
        try {            
            $scope.options.userState.session.displayWorkspaces = true;
            $scope.workspace_service = searchKBaseClientsService.getWorkspaceClient($scope.options.userState.session.token);
            $scope.options.userState.longterm.workspaces = [];

            $(".blockMsg").addClass("search-block-element");
            $("#loading_message_text").html("Looking for workspaces you can copy to...");
            $("#workspace-area").block({message: $("#loading_message")});
        
            //console.log("Calling list_workspace_info");
        
            $scope.workspace_service.list_workspace_info({"perm": "w"})
                .then(function(info, status, xhr) {
                    $scope.$apply(function () {
                        var temp = [];
                        for (var i = 0; i < info.length; i++) {
                            var narname = info[i][8].narrative_nice_name;
                            if (narname != null) {
                                temp.push(info[i]);
                            }
                        }
                        info = temp;
                        $scope.options.userState.longterm.workspaces = info.sort(function (a,b) {
                            var namea = a[8].narrative_nice_name;
                            var nameb = b[8].narrative_nice_name;
                            if (namea.toLowerCase() < nameb.toLowerCase()) return -1;
                            if (namea.toLowerCase() > nameb.toLowerCase()) return 1;
                            return 0;
                        });
                    });

                    $("#workspace-area").unblock();
                    $(".blockMsg").removeClass("search-block-element");
                    //console.log($scope.options.userState.longterm.workspaces);
                },
                function (xhr, status, error) {
                    console.log([xhr, status, error]);
                    $("#workspace-area").unblock();
                    $(".blockMsg").removeClass("search-block-element");
                });
        }
        catch (e) {
            //var trace = printStackTrace();
            //console.log(trace);

            if (e.message && e.name) {
                console.log(e.name + " : " + e.message);
            }
            else {
                console.log(e);
            }
        }
    };


    $scope.selectWorkspace = function(workspace_info) {
        if (workspace_info.length === 10) { //I don't think this case can ever happen
            console.log("Workspace info has length of 10 : " + workspace_info);
            $scope.options.userState.session.selectedWorkspaceName =
                workspace_info[9].narrative_nice_name;
            $scope.options.userState.session.selectedWorkspace = workspace_info[2];
        }
        else {
            $scope.options.userState.session.selectedWorkspaceName =
                workspace_info[8].narrative_nice_name;
            $scope.options.userState.session.selectedWorkspace = workspace_info[1];
        }
    
        angular.element(".workspace-chosen").removeClass("workspace-chosen");
        angular.element("#" + workspace_info[1].replace(":","_") + "_" + workspace_info[4]).addClass("workspace-chosen");
        
        $scope.options.objectsTransferred = 0;
        $scope.options.transferRequests = 0;
        $scope.options.transferSize = 0;
        $scope.options.duplicates = {};
        $scope.options.userState.session.displayWorkspaces = false;
    };


    $scope.copyGenome = function(n) {
        return $scope.workspace_service.get_object_info([{"name": $scope.options.userState.session.data_cart.data[n]["genome_id"], "workspace": $scope.options.userState.session.data_cart.data[n]["workspace_name"].split("Rich").join("")}])
            .fail(function (xhr, status, error) {
                console.log(xhr);
                console.log(status);
                console.log(error);
            })
            .done(function (info, status, xhr) {
                setTimeout(function() { ; }, 200);                        
            
                var max_tries = 10;
                var tries = 0;

                console.log('info',info);
                console.log($scope.options.userState.session.data_cart.data[n]["workspace_name"]);

                var copy_genome = function () {
                    $scope.workspace_service.copy_object({
                        "from": {
                                 "workspace": $scope.options.userState.session.data_cart.data[n]["workspace_name"].split("Rich").join(""), 
                                 "name": info[0][1]
                                }, 
                        "to": {
                               "workspace": $scope.options.userState.session.selectedWorkspace, 
                               "name": info[0][1]
                              }
                        }, success, error);        
                };

                function success(result) {
                    $scope.$apply(function () {
                        $scope.options.objectsTransferred += 1;
                        $scope.options.duplicates[n] = {};
                        if ($scope.options.objectsTransferred === $scope.options.transferSize) {
                            $scope.completeTransfer();
                        }
                    });
                }

                function error(result) {
                    if (tries < max_tries) {
                        tries += 1;
                        console.log("Failed save, number of retries : " + (tries - 1));
                        copy_genome();
                    }
                    else {
                        console.log(xhr);
                        console.log(status);
                        console.log(error);
                        console.log(feature_obj);
                    }


                    console.log("Object failed to copy");
                    console.log(result);
                
                    $scope.transferError($scope.options.userState.session.data_cart.data[n]["object_name"], 
                                         $scope.options.userState.session.data_cart.data[n]["object_ref"], 
                                         result);                            
                }

                $scope.options.transferRequests += 1;
                    
                copy_genome();                    
            });
    
    };


    $scope.copyGenomeSet = function(n) {
    
    };
    
    
    $scope.copyMetagenome = function(n) {
        return $scope.workspace_service.get_object_info([{"name": $scope.options.userState.session.data_cart.data[n]["object_name"], "workspace": $scope.options.publicWorkspaces['metagenomes']}])
            .fail(function (xhr, status, error) {
                console.log(xhr);
                console.log(status);
                console.log(error);
            })
            .done(function (info, status, xhr) {
                function success(result) {
                    $scope.$apply(function () {
                        $scope.options.objectsTransferred += 1;
                        $scope.options.duplicates[n] = {};
                        if ($scope.options.objectsTransferred === $scope.options.transferSize) {
                            $scope.completeTransfer();
                        }
                    });
                }

                function error(result) {
                    console.log("Object failed to copy");
                    console.log(result);
                    $scope.transferError($scope.options.userState.session.data_cart.data[n]["object_name"], 
                                         $scope.options.userState.session.data_cart.data[n]["object_ref"], 
                                         result);
                }
                        
                $scope.options.transferRequests += 1;
        
                $scope.workspace_service.copy_object({"from": {"workspace": $scope.options.publicWorkspaces['metagenomes'], "name": info[0][1]}, "to": {"workspace": $scope.options.userState.session.selectedWorkspace, "name": $scope.options.userState.session.data_cart.data[n]["object_name"]}}, success, error);        
            });                
    };
    
    
    $scope.copyFeature = function(n) {
        //console.log($scope.options.userState.session.data_cart.data[n]["object_id"]);
        var split_id = $scope.options.userState.session.data_cart.data[n]["object_id"].split('/');
        //console.log("/features/" + split_id[2]);
        //console.log($scope.options.userState.session.data_cart.data[n]["genome_id"] + ".featureset");
        
        return $scope.workspace_service.get_object_subset([{"name": $scope.options.userState.session.data_cart.data[n]["genome_id"] + ".featureset",
                                                            "workspace": $scope.options.userState.session.data_cart.data[n]["workspace_name"], 
                                                            "included": ["/features/" + split_id[2]]
                                                          }])
            .fail(function (xhr, status, error) {
                console.log(xhr);
                console.log(status);
                console.log(error);
            })
            .done(function (data, status, xhr) {
                setTimeout(function() { ; }, 100);
                
                $scope.options.transferRequests += 1;
                
                var feature_source_obj;
                var feature_dest_obj = {};
        
                try {
                    feature_source_obj = data[0].data.features[$scope.options.userState.session.data_cart.data[n]["feature_id"]].data;
                    
                    for (var p in feature_source_obj) {
                        if (feature_source_obj.hasOwnProperty(p)) {
                            if (p === "feature_id") {
                                feature_dest_obj["id"] = angular.copy(feature_source_obj[p]);
                            }
                            else if (p === "feature_type") {
                                feature_dest_obj["type"] = angular.copy(feature_source_obj[p]);
                            }
                            else if (p === "location") {
                                var sortedOrdinals = feature_source_obj[p].sort(function (a,b) {
                                                          if (a[4] < b[4]) return -1;
                                                          if (a[4] > b[4]) return 1;
                                                          return 0;
                                                      });         
                                                      
                                feature_dest_obj[p] = [];
                                for (var i = sortedOrdinals.length - 1; i >= 0; i--) {
                                    feature_dest_obj[p].unshift(sortedOrdinals[i].slice(0,4));
                                }
                            }
                            else if (p === "aliases") {
                                feature_dest_obj[p] = [];
                                for (var k in feature_source_obj[p]) {
                                    if (feature_source_obj[p].hasOwnProperty(k)) {
                                        feature_dest_obj[p].push(k + ":" + feature_source_obj[p][k])
                                    }                                
                                }
                            }
                            else {
                                if (feature_source_obj[p]) {
                                    feature_dest_obj[p] = angular.copy(feature_source_obj[p]);
                                }
                            }                                                                
                        }
                    }
                    //console.log(feature_source_obj);
                    //console.log(feature_dest_obj);
                } 
                catch (e) {
                    console.log(n);
                    console.log(e);
                }
            
                var max_tries = 10;
                var tries = 0;
            
                // wrap this in a function so that we can retry on failure
                var save_feature = function () {
                    $scope.workspace_service.save_objects({"workspace": $scope.options.userState.session.selectedWorkspace, 
                                                           "objects": [{"data": feature_dest_obj, 
                                                                        "type": "KBaseGenomes.Feature", 
                                                                        "name": feature_source_obj["feature_id"], 
                                                                        "provenance": [{"time": new Date().toISOString().split('.')[0] + "+0000", 
                                                                                        "service": "KBase Search", 
                                                                                        "description": "Created from a Public Genome Feature", 
                                                                                        "input_ws_objects": []}], 
                                                                        "meta": {}
                                                                       }]
                                                           })
                        .fail(function (xhr, status, error) {
                            if (tries < max_tries) {
                                tries += 1;
                                console.log("Failed save, number of retries : " + (tries - 1));
                                save_feature();
                            }
                            else {
                                console.log(xhr);
                                console.log(status);
                                console.log(error);
                                console.log(feature_dest_obj);
                                return error;
                            }
                        })
                        .done(function (info, status, xhr) {
                            console.log("Save successful, object info : " + info);
                            $scope.$apply(function () {
                                $scope.options.objectsTransferred += 1;
                                $scope.options.duplicates[n] = {};
                                if ($scope.options.objectsTransferred === $scope.options.transferSize) {
                                    $scope.completeTransfer();
                                }
                            });
                            return info;
                        });        
                    
                };
            
                // start the save
                save_feature();                                                                    
            });
    };
            

    // grab a public object and make a copy to a user's workspace
    $scope.copyTypedObject = function(n, object_name, object_ref, from_workspace_name, to_workspace_name) {
        function success(result) {
            console.log("Object " + object_name + " copied successfully from " + from_workspace_name + " to " + to_workspace_name + " .");
            $scope.$apply(function () {
                $scope.options.objectsTransferred += 1;
                $scope.options.duplicates[n] = {};
                if ($scope.options.objectsTransferred === $scope.options.transferSize) {
                    $scope.completeTransfer();
                }
            });
        }
    
        function error(result) {
            console.log("Object " + object_name + " failed to copy from " + from_workspace_name + " to " + to_workspace_name + " .");
            console.log(result);
            $scope.transferError(object_name, object_ref, result);
        }

        $scope.options.transferRequests += 1;

        if (object_ref === undefined || object_ref === null) {
            console.log("no object ref for name " + object_name);
            return $scope.workspace_service.copy_object({"from": {"workspace": from_workspace_name, "name": object_name}, "to": {"workspace": to_workspace_name, "name": object_name}}, success, error);        
        }
        else {
            console.log("had object ref " + object_ref);
            return $scope.workspace_service.copy_object({"from": {"ref": object_ref}, "to": {"workspace": to_workspace_name, "name": object_name}}, success, error);
        }
    };


    // grab all selected search results and copy those objects to the user's selected workspace
    $scope.addAllObjects = function() {
        if (!$scope.options.userState.session.selectedWorkspace) {
            console.log("select a Narrative first");
            return;
        }
        
        $scope.workspace_service = searchKBaseClientsService.getWorkspaceClient($scope.options.userState.session.token);

        var loop_requests = [];
        var max_simultaneous = 10;
        var ws_requests = [];
        var batches = 1;
        var types = {};
        
        $scope.options.transferSize = $scope.options.userState.session.transfer_cart.size;
        $scope.options.transferring = true;
        $scope.options.transferRequests = 0;

        //console.log($scope.options.userState.session.transfer_cart);
        
        var batchCopyRequests = function(ws_objects) {
            var ws_requests = [];
        
            for (var i = 0; i < ws_objects.length; i++) {    
                var record = $scope.options.userState.session.data_cart.data[ws_objects[i]];


                console.log('copy record', record);
                if(record.ws_ref && record.genome_id) {
                    console.log('has wsid and genome_id');
                    // params = n, object_name, object_ref, from_workspace_name, to_workspace_name
                    var new_name = record['genome_id'];
                    ws_requests.push($scope.copyTypedObject(
                                                    ws_objects[i],
                                                    new_name, 
                                                    record["ws_ref"], 
                                                    null, 
                                                    $scope.options.userState.session.selectedWorkspace).then(function () {;}));

                } else {
                    if (record["object_type"].indexOf("KBaseSearch.Genome") > -1) {
                        ws_requests.push($scope.copyGenome(ws_objects[i]).then(function () {;}));
                        if (!types.hasOwnProperty('genomes')) {
                            types['genomes'] = true;
                        }
                    }                    
                    else if (record["object_type"].indexOf("KBaseSearch.Feature") > -1) {                
                        ws_requests.push($scope.copyFeature(ws_objects[i]).then(function () {;}));
                        if (!types.hasOwnProperty('features')) {
                            types['features'] = true;
                        }
                    }
                    else if (record["object_type"].indexOf("Communities.Metagenome") > -1) {
                        ws_requests.push($scope.copyMetagenome(ws_objects[i]).then(function () {;}));
                        if (!types.hasOwnProperty('metagenomes')) {
                            types['metagenomes'] = true;
                        }
                    }
                    else {
                        if (record["object_type"].indexOf("KBaseFBA") > -1 ||
                            record["object_type"].indexOf("KBaseBiochem") > -1) {
                            if (!types.hasOwnProperty('models')) {
                                types['models'] = true;
                            }                    
                        }
                        
                        if (record["object_type"].indexOf("KBaseGwas") > -1) {
                            if (!types.hasOwnProperty('gwas')) {
                                types['gwas'] = true;
                            }                    
                        }
                
                        //generic solution for types
                        if (record.hasOwnProperty("object_name") === true) {
                            //console.log($scope.options.userState.session.data_cart.data[ws_objects[i]]);
                            ws_requests.push($scope.copyTypedObject(
                                                    ws_objects[i],
                                                    record["object_name"], 
                                                    record["object_ref"], 
                                                    record["workspace_name"], 
                                                    $scope.options.userState.session.selectedWorkspace).then(function () {;}));                    
                        }
                        else if (record.hasOwnProperty("object_id") === true) {
                            console.log(record);

                            $scope.workspace_service.get_object_info([{"name": record["object_id"], "workspace": record["workspace_name"]}])
                                .fail(function (xhr, status, error) {
                                    console.log(xhr);
                                    console.log(status);
                                    console.log(error);
                                })
                                .done(function (info, status, xhr) {
                                    ws_requests.push($scope.copyTypedObject(
                                                        ws_objects[i],
                                                        info[0][1], 
                                                        record["object_ref"], 
                                                        record["workspace_name"], 
                                                        $scope.options.userState.session.selectedWorkspace).then(function () {;}));
                                });
                        }
                        else {
                            // create error popover
                            console.log("no object reference found");
                            return;
                        }
                    }
                } // end type if else
            } // end for loop
                    
            $q.all(ws_requests).then(function (result) {
                    $scope.workspace_service.get_workspace_info({"workspace": $scope.options.userState.session.selectedWorkspace}).then(
                        function (info) {
                            for (var i = $scope.options.userState.longterm.workspaces.length - 1; i >= 0; i--) {
                                if ($scope.options.userState.longterm.workspaces[i][1] === $scope.options.userState.session.selectedWorkspace) {
                                     $scope.$apply(function () {
                                         $scope.options.userState.longterm.workspaces[i][4] = info[4];
                                     });
                                     
                                     break;
                                }
                            }
                            
                            //console.log([$scope.options.objectsTransferred, $scope.options.transferSize]);
                        },
                        function (error) {
                            console.log(error);
                        });

                    return result;
                }, 
                function (error) {
                    return error;
                });
        }; // end function

        // check for duplicates
        console.log("Copying objects...");

        for (var n in $scope.options.userState.session.data_cart.data) {
            if ($scope.options.userState.session.data_cart.data.hasOwnProperty(n)) {
                loop_requests.push(n);
            }
    
            if (loop_requests.length === max_simultaneous) {
                batchCopyRequests(loop_requests);
                loop_requests = [];                
            }
        }

        if (loop_requests.length > 0) {
            batchCopyRequests(loop_requests);
            loop_requests = [];
        }        

        //console.log(types);
        
        for (var t in types) {
            if (types.hasOwnProperty(t) && $scope.options.userState.session.data_cart.types[t].hasOwnProperty("all")) {
                $scope.options.userState.session.data_cart.types[t].all = false;
            }
            else if (types.hasOwnProperty(t) && $scope.options.userState.session.data_cart.types[t].hasOwnProperty("subtypes")) {
                for (var s in $scope.options.userState.session.data_cart.types[t].subtypes) {
                    if ($scope.options.userState.session.data_cart.types[t].subtypes.hasOwnProperty(s)) {
                        $scope.options.userState.session.data_cart.types[t].subtypes[s].all = false;            
                    }
                }
            }
        }        
    }; // end function


    // grab all selected search results and create a set referencing them in the user's selected workspace
    $scope.addSet = function() {
        if (!$scope.options.userState.session.selectedWorkspace) {
            console.log("select a Narrative first");
            return;
        }
        
        $scope.workspace_service = searchKBaseClientsService.getWorkspaceClient($scope.options.userState.session.token);

        var loop_requests = [];
        var max_simultaneous = 10;
        var ws_requests = [];
        var batches = 1;
        var types = {};
        
        $scope.options.transferSize = $scope.options.userState.session.transfer_cart.size;
        $scope.options.transferring = true;
        $scope.options.transferRequests = 0;

        //console.log($scope.options.userState.session.transfer_cart);

        // check for duplicates
        console.log("Copying objects...");
        
        if ($scope.options.userState.session.data_cart.data[ws_objects[i]]["object_type"].indexOf("KBaseSearch.GenomeSet") > -1) {
            ws_requests.push($scope.copyGenomeSet(ws_objects[i]).then(function () {;}));
            if (!types.hasOwnProperty('genomes')) {
                types['genomes'] = true;
            }
        }                    
        else if ($scope.options.userState.session.data_cart.data[ws_objects[i]]["object_type"].indexOf("KBaseSearch.FeatureSet") > -1) {                
            ws_requests.push($scope.copyFeatureSet(ws_objects[i]).then(function () {;}));
            if (!types.hasOwnProperty('features')) {
                types['features'] = true;
            }
        }
        else if ($scope.options.userState.session.data_cart.data[ws_objects[i]]["object_type"].indexOf("Communities.MetagenomeSet") > -1) {
            ws_requests.push($scope.copyMetagenomeSet(ws_objects[i]).then(function () {;}));
            if (!types.hasOwnProperty('metagenomes')) {
                types['metagenomes'] = true;
            }
        }
        else if ($scope.options.userState.session.data_cart.data[ws_objects[i]]["object_type"].indexOf("KBaseFBA.FBAModelSet") > -1) {
            ws_requests.push($scope.copyFBAModelSet(ws_objects[i]).then(function () {;}));
            if (!types.hasOwnProperty('models')) {
                types['models'] = true;
            }
        } // end type if else
                
        $q.all(ws_requests).then(function (result) {
                $scope.workspace_service.get_workspace_info({"workspace": $scope.options.userState.session.selectedWorkspace}).then(
                    function (info) {
                        for (var i = $scope.options.userState.longterm.workspaces.length - 1; i >= 0; i--) {
                            if ($scope.options.userState.longterm.workspaces[i][1] === $scope.options.userState.session.selectedWorkspace) {
                                 $scope.$apply(function () {
                                     $scope.options.userState.longterm.workspaces[i][4] = info[4];
                                 });
                                 
                                 break;
                            }
                        }
                        
                        //console.log([$scope.options.objectsTransferred, $scope.options.transferSize]);
                    },
                    function (error) {
                        console.log(error);
                    });

                return result;
            }, 
            function (error) {
                return error;
            });

        //console.log(types);
        
        for (var t in types) {
            if (types.hasOwnProperty(t) && $scope.options.userState.session.data_cart.types[t].hasOwnProperty("all")) {
                $scope.options.userState.session.data_cart.types[t].all = false;
            }
            else if (types.hasOwnProperty(t) && $scope.options.userState.session.data_cart.types[t].hasOwnProperty("subtypes")) {
                for (var s in $scope.options.userState.session.data_cart.types[t].subtypes) {
                    if ($scope.options.userState.session.data_cart.types[t].subtypes.hasOwnProperty(s)) {
                        $scope.options.userState.session.data_cart.types[t].subtypes[s].all = false;            
                    }
                }
            }
        }        
    }; // end function




    $scope.copySet = function(type) {
        $scope.toggleAllDataCart(type);
        $scope.addSet(type); 
        $scope.toggleAllDataCart();
        $scope.emptyTransfers();
    };

    
    $scope.copyData = function(type) {
        $scope.toggleAllDataCart(type);
        //$scope.hideTransferCartCheckboxes();
        $scope.addAllObjects(type); 
        $scope.toggleAllDataCart();
        $scope.emptyTransfers();
    };

    $scope.hideTransferCartCheckboxes = function () {
        angular.element("input .search-data-cart-checkbox").addClass("hidden");
    };

    $scope.showTransferCartCheckboxes = function () {
        angular.element("input.search-data-cart-checkbox").removeClass("hidden");
    };

    $scope.completeTransfer = function() {
        if ($scope.options.transferSize === $scope.options.objectsTransferred) {
            $scope.options.transferring = false;
            $scope.showTransferCartCheckboxes();
        }
    };

    $scope.removeSelection = function(n) {
        if (n.object_type.indexOf(".Genome") > -1) {
            delete $scope.options.userState.session.data_cart.types['genomes'].markers[n.row_id]; 
            $scope.options.userState.session.data_cart.types['genomes'].size -= 1; 
        }
        else if (n.object_type.indexOf(".Feature") > -1) {
            delete $scope.options.userState.session.data_cart.types['features'].markers[n.row_id]; 
            $scope.options.userState.session.data_cart.types['features'].size -= 1;         
        }
        else if (n.object_type.indexOf(".Metagenome") > -1) {
            delete $scope.options.userState.session.data_cart.types['metagenomes'].markers[n.row_id]; 
            $scope.options.userState.session.data_cart.types['metagenomes'].size -= 1; 
        }
        else if (n.object_type.indexOf(".FBAModel") > -1 || n.object_type.indexOf(".Media") > -1) {
            delete $scope.options.userState.session.data_cart.types['models'].markers[n.row_id]; 
            $scope.options.userState.session.data_cart.types['models'].size -= 1; 
        }
        else if (n.object_type.indexOf("KBaseGwas") > -1) {
            delete $scope.options.userState.session.data_cart.types['gwas'].markers[n.row_id]; 
            $scope.options.userState.session.data_cart.types['gwas'].size -= 1; 
        }
        else {
            throw Error("Trying to delete unknown type!");        
        }
    
        delete $scope.options.userState.session.data_cart.data[n.row_id];
        $scope.options.userState.session.data_cart.size -= 1;  
    };
    
    $scope.emptyCart = function() {
        $scope.options.userState.session.selectAll = {};
        $scope.options.userState.session.data_cart = {
            all: false, 
            size: 0,
            data: {}, 
            types: {
                'genomes': {all: false, size: 0, markers: {}},
                'features': {all: false, size: 0, markers: {}},
                'metagenomes': {all: false, size: 0, markers: {}},
                'models': {size: 0,
                           subtypes: {
                               'models_fba': {all: false, size: 0, markers: {}},
                               'models_media': {all: false, size: 0, markers: {}}
                           }
                        }
            }
        };
    };
    
    $scope.emptyTransfers = function() {        
        $scope.options.objectsTransferred = 0;

        $scope.saveUserState();
    };
    
    $scope.transferError = function(object_name, object_ref, result) {
        if (!$scope.options.userState.session.transferErrors) {
            $scope.options.userState.session.transferErrors = {};
        }
        $scope.options.userState.session.transferErrors[object_name] = {error: result};        
    };

    $scope.toggleCheckbox = function(id, item) {
        if (!$scope.options.userState.session.data_cart.data.hasOwnProperty(id)) {
            $scope.selectCheckbox(id, item);
        }
        else {
            $scope.deselectCheckbox(id, item);
        }

        $scope.saveUserState();
    };

    $scope.selectCheckbox = function(id, item) {
        if (!$scope.options.userState.session.data_cart.data.hasOwnProperty(id)) {
            if (item.object_type.indexOf(".Genome") > -1) {
                $scope.options.userState.session.data_cart.size += 1;
                $scope.options.userState.session.data_cart.data[id] = {
                    "workspace_name": item.workspace_name,
                    "object_type": item.object_type,
                    "object_id": item.object_id,
                    "object_ref": item.object_ref,
                    "row_id": item.row_id,
                    "genome_id": item.genome_id,
                    "scientific_name": item.scientific_name,
                    "domain": item.domain,
                    "gc_content": item.gc_content,
                    "num_contigs": item.num_contigs,
                    "num_cds": item.num_cds,
                    "genome_dna_size": item.genome_dna_size,
                    "ws_ref": item.ws_ref,
                    "cart_selected": false
                };
                $scope.options.userState.session.data_cart.types['genomes'].markers[id] = {}; 
                $scope.options.userState.session.data_cart.types['genomes'].size += 1; 
            }
            else if (item.object_type.indexOf(".Feature") > -1) {
                $scope.options.userState.session.data_cart.size += 1;
                $scope.options.userState.session.data_cart.data[id] = {
                    "workspace_name": item.workspace_name,
                    "object_id": item.object_id,
                    "object_ref": item.object_ref,
                    "object_type": item.object_type,
                    "row_id": item.row_id,
                    "genome_id": item.genome_id,
                    "feature_id": item.feature_id,
                    "feature_source_id": item.feature_source_id,
                    "scientific_name": item.scientific_name,
                    "feature_type": item.feature_type,
                    "dna_sequence_length": item.dna_sequence_length,
                    "protein_translation_length": item.protein_translation_length,
                    "function": item.function,
                    "aliases": item.aliases,
                    "ws_ref": item.ws_ref,
                    "cart_selected": false
                };
                $scope.options.userState.session.data_cart.types['features'].markers[id] = {}; 
                $scope.options.userState.session.data_cart.types['features'].size += 1;         
            }
            else if (item.object_type.indexOf(".Metagenome") > -1) {
                $scope.options.userState.session.data_cart.size += 1;
                $scope.options.userState.session.data_cart.data[id] = {
                    "workspace_name": item.workspace_name,
                    "object_id": item.object_id,
                    "object_ref": item.object_ref,
                    "object_name": item.object_name,
                    "object_type": item.object_type,
                    "row_id": item.row_id,
                    "metagenome_id": item.metagenome_id,
                    "metagenome_name": item.metagenome_name,
                    "project_name": item.project_name,
                    "sample_name": item.sample_name,
                    "cart_selected": false
                };
                $scope.options.userState.session.data_cart.types['metagenomes'].markers[id] = {}; 
                $scope.options.userState.session.data_cart.types['metagenomes'].size += 1; 
            }
            else if (item.object_type.indexOf("KBaseFBA") > -1 || item.object_type.indexOf("KBaseBiochem") > -1) {
                if (item.object_type.indexOf(".FBAModel") > -1) {
                    $scope.options.userState.session.data_cart.types['models'].subtypes['models_fba'].markers[id] = {}; 
                    $scope.options.userState.session.data_cart.types['models'].subtypes['models_fba'].size += 1; 
                    $scope.options.userState.session.data_cart.types['models'].size += 1; 
                    $scope.options.userState.session.data_cart.data[id] = {
                        "workspace_name": item.workspace_name,
                        "object_id": item.object_id,
                        "object_ref": item.object_ref,
                        "object_name": item.object_name,
                        "object_type": item.object_type,
                        "row_id": item.row_id,
                        "fba_model_id": item.fba_model_id,
                        "scientific_name": item.scientific_name,
                        "number_of_features": item.number_of_features,
                        "number_of_reactions": item.number_of_reactions,
                        "number_of_gapfillings": item.number_of_gapfillings,
                        "cart_selected": false
                    };
                }
                else if (item.object_type.indexOf(".Media") > -1) {
                    $scope.options.userState.session.data_cart.types['models'].subtypes['models_media'].markers[id] = {}; 
                    $scope.options.userState.session.data_cart.types['models'].subtypes['models_media'].size += 1; 
                    $scope.options.userState.session.data_cart.types['models'].size += 1; 
                    $scope.options.userState.session.data_cart.data[id] = {
                        "workspace_name": item.workspace_name,
                        "object_id": item.object_id,
                        "object_ref": item.object_ref,
                        "object_name": item.object_name,
                        "object_type": item.object_type,
                        "row_id": item.row_id,
                        "media_id": item.media_id,
                        "media_name": item.media_name,
                        "media_type": item.media_type,
                        "number_of_compounds": item.number_of_compounds,
                        "is_defined": item.is_defined,
                        "is_minimal": item.is_minimal,
                        "cart_selected": false
                    };
                }
                else {
                    throw Error("Unknown Model type : " + item.object_type);
                }

                $scope.options.userState.session.data_cart.size += 1;                
            }
            else {
                throw Error("Trying to add unknown type!");        
            }
        }
    };
        
    $scope.deselectCheckbox = function(id, item) {
        if ($scope.options.userState.session.data_cart.data.hasOwnProperty(id)) {
            delete $scope.options.userState.session.data_cart.data[id];           
            $scope.options.userState.session.data_cart.size -= 1;

            if (item.object_type.indexOf(".Genome") > -1) {
                delete $scope.options.userState.session.data_cart.types['genomes'].markers[id]; 
                $scope.options.userState.session.data_cart.types['genomes'].size -= 1; 
            }
            else if (item.object_type.indexOf(".Feature") > -1) {
                delete $scope.options.userState.session.data_cart.types['features'].markers[id]; 
                $scope.options.userState.session.data_cart.types['features'].size -= 1;         
            }
            else if (item.object_type.indexOf(".Metagenome") > -1) {
                delete $scope.options.userState.session.data_cart.types['metagenomes'].markers[id]; 
                $scope.options.userState.session.data_cart.types['metagenomes'].size -= 1; 
            }
            else if (item.object_type.indexOf("KBaseFBA") > -1 || item.object_type.indexOf("KBaseBiochem") > -1) {
                if (item.object_type.indexOf(".FBAModel") > -1) {
                    delete $scope.options.userState.session.data_cart.types['models'].subtypes['models_fba'].markers[id];
                    $scope.options.userState.session.data_cart.types['models'].subtypes['models_fba'].size -= 1; 
                    $scope.options.userState.session.data_cart.types['models'].size -= 1; 
                }
                else if (item.object_type.indexOf(".Media") > -1) {
                    delete $scope.options.userState.session.data_cart.types['models'].subtypes['models_media'].markers[id];
                    $scope.options.userState.session.data_cart.types['models'].subtypes['models_media'].size -= 1; 
                    $scope.options.userState.session.data_cart.types['models'].size -= 1; 
                }
            }
            else {
                throw Error("Trying to delete unknown type!");        
            }
        }
    };


    $scope.toggleAll = function(items) {        
        var i;
        
        if ($scope.options.userState.session.selectAll.hasOwnProperty($scope.options.currentURL)) {
            if ($scope.options.userState.session.selectAll[$scope.options.currentURL].hasOwnProperty($scope.options.currentItemRange) && $scope.options.userState.session.selectAll[$scope.options.currentURL][$scope.options.currentItemRange]) {
                $scope.options.userState.session.selectAll[$scope.options.currentURL][$scope.options.currentItemRange] = false;

                for(i = items.length - 1; i > -1; i--) {
                    $scope.deselectCheckbox(items[i].row_id,items[i]);
                }            

            }
            else {
                $scope.options.userState.session.selectAll[$scope.options.currentURL][$scope.options.currentItemRange] = true;

                for(i = items.length - 1; i > -1; i--) {
                    $scope.selectCheckbox(items[i].row_id,items[i]);
                }            
            }
        }
        else {
            $scope.options.userState.session.selectAll[$scope.options.currentURL] = {};
            $scope.options.userState.session.selectAll[$scope.options.currentURL][$scope.options.currentItemRange] = true;

            for(i = items.length - 1; i > -1; i--) {
                $scope.selectCheckbox(items[i].row_id,items[i]);
            }            
        }

        //console.log($scope.options.userState);
        $scope.saveUserState();
    };

/*
    $scope.toggleAllTransferCart = function() {
        if ($scope.options.userState.session.transfer_cart.all) {
            for (var d in $scope.options.userState.session.transfer_cart.items) {
                if ($scope.options.userState.session.data_cart.data.hasOwnProperty(d)) {
                    $scope.options.userState.session.data_cart.data[d].cart_selected = true;
                }
            }        
        }
        else {
            for (var d in $scope.options.userState.session.transfer_cart.items) {
                if ($scope.options.userState.session.data_cart.data.hasOwnProperty(d)) {
                    $scope.options.userState.session.data_cart.data[d].cart_selected = false;
                }
            }                    
        }
    };
*/

    $scope.toggleAllDataCart = function(type) {
        console.log("toggleAllDataCart : " + type);

        var d;
    
        if (typeof type === 'undefined' || type === null) {
            if ($scope.options.userState.session.data_cart.all) {
                for (d in $scope.options.userState.session.data_cart.data) {
                    if ($scope.options.userState.session.data_cart.data.hasOwnProperty(d)) {
                        $scope.options.userState.session.data_cart.data[d].cart_selected = true;
                    }
                }                    
                $scope.addSelectedToTransferCart();
                $scope.isCartInWorkspace();
            }
            else {
                for (d in $scope.options.userState.session.data_cart.data) {
                    if ($scope.options.userState.session.data_cart.data.hasOwnProperty(d)) {
                        $scope.options.userState.session.data_cart.data[d].cart_selected = false;
                    }
                }                    
                $scope.emptyTransferCart();
            }    
        }
        else if ($scope.options.userState.session.data_cart.types.hasOwnProperty(type)) {
            if ($scope.options.userState.session.data_cart.types[type].all) {
                for (d in $scope.options.userState.session.data_cart.types[type].markers) {
                    if ($scope.options.userState.session.data_cart.types[type].markers.hasOwnProperty(d)) {
                        $scope.options.userState.session.data_cart.data[d].cart_selected = false;
                    }
                }                    
                $scope.emptyTransferCart();
            }
            else {
                for (d in $scope.options.userState.session.data_cart.types[type].markers) {
                    if ($scope.options.userState.session.data_cart.types[type].markers.hasOwnProperty(d)) {
                        $scope.options.userState.session.data_cart.data[d].cart_selected = true;
                    }
                }                    
                $scope.addSelectedToTransferCart();
                $scope.isCartInWorkspace();
            }    
        }
        else {
            // look for subtypes
            for (var t in $scope.options.userState.session.data_cart.types) {
                if ($scope.options.userState.session.data_cart.types.hasOwnProperty(t) && 
                    $scope.options.userState.session.data_cart.types[t].hasOwnProperty("subtypes") && 
                    $scope.options.userState.session.data_cart.types[t].subtypes.hasOwnProperty(type)) {
                    
                    if ($scope.options.userState.session.data_cart.types[t].subtypes[type].all) {
                        for (d in $scope.options.userState.session.data_cart.types[t].subtypes[type].markers) {
                            if ($scope.options.userState.session.data_cart.types[t].subtypes[type].markers.hasOwnProperty(d)) {
                                $scope.options.userState.session.data_cart.data[d].cart_selected = false;
                            }
                        }                    
                        $scope.emptyTransferCart();
                        return;
                    }
                    else {
                        for (d in $scope.options.userState.session.data_cart.types[t].subtypes[type].markers) {
                            if ($scope.options.userState.session.data_cart.types[t].subtypes[type].markers.hasOwnProperty(d)) {
                                $scope.options.userState.session.data_cart.data[d].cart_selected = true;
                            }
                        }                    
                        $scope.addSelectedToTransferCart();
                        $scope.isCartInWorkspace();
                        return;
                    }                        
                }
            }
            
            // if we fell through to this point the type specified was not found, throw an error            
            throw Error("Unrecognized type : " + type);            
        }
    };


    $scope.toggleInCart = function(id) {
        if(!$scope.options.userState.session.data_cart.data[id].cart_selected) {
            $scope.options.userState.session.data_cart.data[id].cart_selected = true;
            $scope.addToTransferCart(id);
            $scope.isObjectInWorkspace(id);
        }
        else {
            $scope.options.userState.session.data_cart.data[id].cart_selected = false;
            $scope.removeFromTransferCart(id);
        }                    
    };


    $scope.addSelectedToTransferCart = function() {
        for (var d in $scope.options.userState.session.data_cart.data) {
            if ($scope.options.userState.session.data_cart.data.hasOwnProperty(d) && $scope.options.userState.session.data_cart.data[d].cart_selected && !$scope.options.userState.session.transfer_cart.items.hasOwnProperty(d)) {
                $scope.addToTransferCart(d);
            }
        }
    };


    $scope.removeSelectedFromTransferCart = function() {
        for (var d in $scope.options.userState.session.data_cart.data) {
            if ($scope.options.userState.session.data_cart.data.hasOwnProperty(d) && $scope.options.userState.session.data_cart.data[d].cart_selected) {
                $scope.removeFromTransferCart(d);
            }
        }
    };


    $scope.addToTransferCart = function(id) {
        console.log("Adding to cart : " + id);
    
        if (!$scope.options.userState.session.transfer_cart.items.hasOwnProperty(id)) {
            $scope.options.userState.session.transfer_cart.items[id] = {};
            $scope.options.userState.session.transfer_cart.size += 1;                
        }
    };

    $scope.removeFromTransferCart = function(id) {
        if ($scope.options.userState.session.transfer_cart.items.hasOwnProperty(id)) {
            delete $scope.options.userState.session.transfer_cart.items[id];
            $scope.options.userState.session.transfer_cart.size -= 1;
        }
    };


    $scope.emptyTransferCart = function() {
        $scope.options.userState.session.transfer_cart.items = {};
        $scope.options.userState.session.transfer_cart.size = 0;
    };
    
    $scope.removeCartSelected = function() {
        for (var d in $scope.options.userState.session.data_cart.data) {
            if ($scope.options.userState.session.data_cart.data.hasOwnProperty(d) && $scope.options.userState.session.data_cart.data[d].cart_selected) {
                //console.log(angular.element("#" + d.replace("|","_").replace(/\./g, "\\\.")));
                $scope.removeFromTransferCart(d);
                $scope.removeSelection($scope.options.userState.session.data_cart.data[d]);
                //angular.element("tr#" + d.replace("|","_").replace(/\./g, "\\\.")).remove();
            }
        }
    };


/*
    $scope.isActiveTab = function(category) {
        return ($scope.options.selectedCategory.indexOf(category) === 0) || ($scope.options.data_tabs[category]);
    };

    $scope.setActiveTab = function(category) {
        $scope.options.data_tabs.category = true;    
    };
*/

    $scope.getSearchbarTooltipText = function () {
        if ($scope.options.selectedCategory) {
            return "Type here to perform a search on " + $scope.options.searchCategories[$scope.options.selectedCategory].label + ".";
        }
        else {
            return "Type here to perform a search on all data categories.";
        }    
    };


    $scope.isCartInWorkspace = function() {
        $scope.workspace_service = searchKBaseClientsService.getWorkspaceClient($scope.options.userState.session.token);

        var objects = []; 
        var object_map = [];
        
        var i = 0;
        
        for (var d in $scope.options.userState.session.data_cart.data) {
            if ($scope.options.userState.session.data_cart.data[d].object_type.indexOf(".Genome") > -1) {
                objects.push({"workspace": $scope.options.userState.session.selectedWorkspace,
                              "name": $scope.options.userState.session.data_cart.data[d].genome_id});                
            }
            else if ($scope.options.userState.session.data_cart.data[d].object_type.indexOf(".Feature") > -1) {
                objects.push({"workspace": $scope.options.userState.session.selectedWorkspace,
                              "name": $scope.options.userState.session.data_cart.data[d].feature_id});                                
            }
            else {                
                objects.push({"workspace": $scope.options.userState.session.selectedWorkspace,
                              "name": $scope.options.userState.session.data_cart.data[d].object_name});
            }
            
            object_map[i] = d;
            i += 1;
        }
        
        return $scope.workspace_service.get_object_info_new({"objects": objects, "ignoreErrors": 1})
            .then(
            function (results) {                
                $scope.$apply(function () {
                    for (var i = object_map.length - 1; i > -1; i--) {
                        if (results[i] !== null) {
                            $scope.options.duplicates[object_map[i]] = {};
                        }
                        else {
                            delete $scope.options.duplicates[object_map[i]];
                        }
                    }
                });
            },
            function (error) {
                console.log(error);
            });
    };        


    
    
    $scope.isObjectInWorkspace = function(id) {
        $scope.workspace_service = searchKBaseClientsService.getWorkspaceClient($scope.options.userState.session.token);

        var checkObject;

        if ($scope.options.userState.session.data_cart.data[id].object_type.indexOf(".Genome") > -1) {
            checkObject = {"workspace": $scope.options.userState.session.selectedWorkspace,
                           "name": $scope.options.userState.session.data_cart.data[id].genome_id};                
        }
        else if ($scope.options.userState.session.data_cart.data[id].object_type.indexOf(".Feature") > -1) {
            checkObject = {"workspace": $scope.options.userState.session.selectedWorkspace,
                           "name": $scope.options.userState.session.data_cart.data[id].feature_id};                                
        }
        else {                
            checkObject = {"workspace": $scope.options.userState.session.selectedWorkspace,
                           "name": $scope.options.userState.session.data_cart.data[id].object_name};
        }
        
        return $scope.workspace_service.get_object_info_new({"objects": [checkObject], "ignoreErrors": 1}).then(
            function (results) {
                console.log(results);
            
                $scope.$apply(function () {
                    if (results[0] !== null) {
                        $scope.options.duplicates[id] = {};
                    }
                    else {
                        delete $scope.options.duplicates[id];
                    }
                });
            },
            function (error) {
                console.log(error);
            });    
    };

});

