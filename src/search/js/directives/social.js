/*
 *  Directives
 *
 *  These can be thought of as the 'widgets' on a page.
 *  Scope comes from the controllers.
 *
 */

angular.module('social-directives', []);
angular.module('social-directives')
   .directive('socialuserprofile', function ($rootScope) {
      return {
         link: function (scope, ele, attrs) {
            "use strict";
            require(['kb.widget.social.user_profile', 'jquery'], function (W, $) {
               var widget = Object.create(W);
               widget.init({
                  container: $(ele),
                  userId: scope.params.userid
               }).go();
            });
         }
      };
   })
   .directive('socialusersearch', function ($rootScope) {
      return {
         link: function (scope, ele, attrs) {
            require(['kb.widget.social.user_search'], function (UserSearchWidget) {
               Object.create(UserSearchWidget).init({
                  container: $(ele),
                  userId: scope.params.userid
               }).go();
            });
         }
      };
   })
   /*.directive('kb.widget.social.user_summary', function ($rootScope) {
      return {
         link: function (scope, ele, attrs) {
            require(['kbaseusersummary'], function (Widget) {
               Object.create(Widget).init({
                  container: $(ele),
                  userId: scope.params.userid
               }).go();
            });
         }
      };
   })
   */
   .directive('socialbrowsenarratives', function ($rootScope) {
      return {
         link: function (scope, ele, attrs) {

            require(['kb.widget.social.browse_narratives'], function (Widget) {
               try {
                  var widget = Object.create(Widget);
                  widget.init({
                     container: $(ele),
                     userId: scope.params.userid
                  }).go();
               } catch (ex) {
                  $(ele).html('Error: ' + ex);
               }
            });
         }
      };
   })

.directive('socialusercollaborators', function ($rootScope) {
   return {
      link: function (scope, ele, attrs) {

         require(['kb.widget.social.collaborators'], function (Widget) {
            try {
               var widget = Object.create(Widget);
               widget.init({
                  container: $(ele),
                  userId: scope.params.userid
               }).go();
            } catch (ex) {
               $(ele).html('Error: ' + ex);
            }
         });
      }
   };
})





;