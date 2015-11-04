/*
 *  Directives
 *
 *  These can be thought of as the 'widgets' on a page.
 *  Scope comes from the controllers.
 *
 */

angular.module('dataview', []);
angular.module('dataview')
.directive('dataviewoverview', function($rootScope) {
    return {
        link: function(scope, ele, attrs) {
           "use strict";
           require(['kb.widget.dataview.overview', 'jquery'], function (W, $) {
                var widget = Object.create(W);
                widget.init({
                    container: $(ele),
                    workspaceId: scope.params.wsid,
                    objectId: scope.params.objid,
                    objectVersion: scope.params.ver,
                    sub: scope.params.sub
                }).go();
                scope.$on('$destroy', function () {
                    if (widget) {
                        try {
                            widget.stop();
                        } finally {
                            // What do do here?
                        }
                    }
                });
            });
           
        }
    };
})
.directive('dataviewprovenance', function($rootScope) {
    return {
        link: function(scope, ele, attrs) {
            var $widgetDiv = $('<div>');
	    var widget = $widgetDiv.KBaseWSObjGraphCenteredView({
                                    objNameOrId: scope.params.objid,
                                    wsNameOrId: scope.params.wsid,
                                    kbCache: kb});
            
            var $collapsableHeader = $(
                    '<div class="panel-group" id="provAccordion" role="tablist" aria-multiselectable="true">'+
                         '<div class="panel panel-default kb-widget">'+
                            '<div class="panel-heading" role="tab" id="provHeading">'+
                                '<div class="row"><div class="col-sm-12">' +
                                    '<h4 class="panel-title">'+
                                       '<span data-toggle="collapse" data-parent="#provAccordion"  data-target="#provCollapse" aria-expanded="false" aria-controls="provCollapse" class="collapsed" style="cursor:pointer;">'+
                                          '<span class="fa fa-sitemap fa-rotate-90" style="margin-left:10px;margin-right:10px;"></span> Data Provenance and Reference Network'+
                                       '</span>'+
                                    '</h4>'+
                                '</div></div>'+
                            '</div>'+
                            '<div id="provCollapse" class="panel-collapse collapse" role="tabpanel" aria-labelledby="provHeading">'+
                               '<div class="panel-body">'+
                               '</div>'+
                            '</div>'+
                         '</div>' +
                      '</div>'
            );
    
            $collapsableHeader.find('.panel-body').append($widgetDiv);
            $(ele).append($collapsableHeader);
        }
    }; 
})
.directive('dataviewvisualizer', function($rootScope) {
    return {
        link: function(scope, ele, attrs) {
            var w = $(ele).KBaseDataViewGenericViz({
                    objid: scope.params.objid,
                    wsid: scope.params.wsid,
                    ver: scope.params.ver,
                    sub: scope.params.sub
                });
            /* disabled, but this type of thing is necessary
             * in order to remove suscriptions, etc. from widgets.
            scope.$on('$destroy', function () {
                if (w) {
                    try {
                        if (w.destroy) {
                            w.destroy();
                        }
                    } finally {
                        // What do do here?
                    }
                }
            });
             */
        }
    }; 
});