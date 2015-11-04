/*
 *  Directives
 *
 *  These can be thought of as the 'widgets' on a page.
 *  Scope comes from the controllers.
 *
 */

angular.module('ui', []);
angular.module('ui')
.directive('navbar', function($rootScope) {
    return {
        link: function(scope, ele, attrs) {
          "use strict";
            require(['kb.widget.navbar', 'jquery'], function(W, $) {
                var widget = Object.create(W);
                widget.init({
                    container: $(ele),
                    userId: scope.params.userid
                }).go();
            });
        }
    };
});