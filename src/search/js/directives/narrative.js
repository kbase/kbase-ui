
/*
 * Narrative directives
 *  - narrativeCell : extends functionality of a cell 
 *  - kbWidget : wrapper for jquery output widgets
 *  - ddSelector : searchable angular, bootstrapifyed dropdown used 
 *                 for selectors
 *
 * Controllers:  (See Analysis in js/controllers.js)
 *
 *
 * Authors:
 *  Neal Conrad <nealconrad@gmail.com>
 *
*/

var narrativeDirectives = angular.module('narrative-directives', []);

angular.module('narrative-directives')

.directive('narrativeCell', function(narrative) {
    return {
        link: function(scope, ele, attrs) {

            // dictionary for fields in form.  Here, keys are the ui_name 
            scope.fields = {};  

            scope.flip = function($event) {
                $($event.target).parents('.panel').find('.narrative-cell').toggleClass('flipped')
            }

            scope.minimize = function($event) {
                $($event.target).parents('.panel').find('.panel-body').slideToggle('fast');
            }

            scope.runCell = function(index, cell) {
                var task = {name: cell.title, fields: scope.fields};
                narrative.newTask(task);
            }


        }
    }
})

.directive('showData', function() {
    return {
        link: function(scope, ele, attrs) {

        }
    }
})

.directive('kbWidget', function() {
    return {
        link: function(scope, element, attrs) {
            // instantiation of a kbase widget
        }
    }
})

.directive('animateOnChange', function($animate) {
  return {
      link: function(scope, elem, attr) {
          scope.$watch(attr.animateOnChange, function(nv,ov) {
            if (nv!=ov) {
              var c = nv > ov ? 'change-up' : 'change';
              console.log('changing', c)
              elem.addClass(c).removeClass(c, {duration: 1000})
            }
          });    

        }
   };
})


/* Author:
 *  Neal Conrad <nealconrad@gmail.com>
 */
.directive('ddSelector', function() {
    return {
        templateUrl: 'views/partials/ws-dropdown.html',
        link: function(scope, element, attrs) {

            // model for input
            scope.ddModel = attrs.ddModel;

            // if there is a default for the text box, use it
            if (attrs.ddDefault) {
                scope.ddSelected = attrs.ddDefault;
            }

            // model to watch is the attr 'dd-data'
            scope.$watch(attrs.ddData, function(value) {
                scope.items = value;
            })

            scope.selectedIndex = -1;
            scope.ddSelect = function($index, item) {
                scope.selectedIndex = $index;
                scope.ddSelected = item.name;
            }
            
            // need to make work for state resets
            scope.openDDSelector = function() {
                $(element).find('.input-group-btn').addClass('open');
                $(element).find('.dd-selector' ).focus();
            }
        }
    }
})

.directive('kbUpload', function($location) {
    return {
        link: function(scope, element, attrs) {
            console.log(USER_TOKEN)
            SHOCK.init({ token: USER_TOKEN, url: scope.shockURL })

            var url = "http://140.221.67.190:7078/node" ;

            /*
            var prom = SHOCK.get_all_nodes(function(data) {
                console.log('shock data!', data)
            })*/
            
            var prom = SHOCK.get_all_nodes();
            $.when(prom).done(function(data){
                scope.$apply(function(){
                    scope.uploads = data;
                })
                console.log(data)
            })

        }
    }
})

.directive('recentnarratives', function($location) {
    return {
        link: function(scope, element, attrs) {
            $(element).loading()

            scope.loadRecentNarratives = function() {
             
                var p = kb.ws.list_objects({type: kb.nar_type}).fail(function(e){
                    $(element).rmLoading();
                    $(element).append('<div class="alert alert-danger">'+
                                    e.error.message+'</div>')
                });

                
                $.when(p).done(function(results){
                    $(element).rmLoading();

                    var narratives = [];
                    if (results.length > 0) {
                        for (var i in results) {
                            var nar = {};
                            nar.name = results[i][1];
                            if (nar.name.slice(0,4) == 'auto') continue;

                            nar.id = results[i][0];
                            nar.wsid = results[i][6]
                            nar.ws = results[i][7];
                            nar.owner = results[i][5];

                            nar.timestamp = kb.ui.getTimestamp(results[i][3]);
                            nar.nealtime = kb.ui.formateDate(nar.timestamp) 
                                            ? kb.ui.formateDate(nar.timestamp) : results[i][3].replace('T',' ').split('+')[0];
                            narratives.push(nar);
                        }

                        scope.$apply(function() {
                            scope.narratives = narratives;
                        })
                    } else {
                        $(element).append('no narratives');
                    }
                });
            }

            scope.loadRecentNarratives();
        }  /* end link */
    };
})

.directive('newsfeed', function(FeedLoad, $compile) {
    return  {
        link: function(scope, element, attrs) {
            var feedUrl = 'http://yogi.lbl.gov/eprojectbuilder/misc/kbasefeed2.xml';

            FeedLoad.fetch({q: feedUrl, num: 50}, {}, function (data) {
                var feed = data.responseData.feed;
                var feedContent = $("<div></div>");
                for (entry in feed.entries) {

                    var feedEntry = $("<div></div>");
                    $(feedEntry).addClass("narr-featured-narrative");

                    $(feedEntry).append(feed.entries[entry].content);
                    var copyLink = $("<a></a>");
                    $(copyLink).html("copy narrative");
                    $(copyLink).attr('ng-click',"copyNarrativeForm(\""+feed.entries[entry].title + "\")");
                    $compile(copyLink)(scope);
                    $(feedEntry).append(copyLink);
                    $(feedContent).append($(feedEntry));
                }
                
                $(element).html($(feedContent));
            });

        } 
    };
})

/** NEW FOR FEB 2014 - handles routing to the narrative after login **/
.directive('narrativemanager', function($rootScope) {
    return {
        link: function(scope, element, attrs) {
            var p = scope.params;
            if (typeof configJSON !== null) {
                if (configJSON.setup) {
                    if (configJSON[configJSON.setup]) {
                        if (configJSON[configJSON.setup].workspace_url) {
                            p.ws_url = configJSON[configJSON.setup].workspace_url;
                        }
                    }
                    
                }
            }
            $(element).kbaseNarrativeManager({
                params:p,
                loadingImage: "assets/img/ajax-loader.gif"
                });
        }
    }
});






