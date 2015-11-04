/**
Data view controller and utils.
*/

app.controller('Dataview', function ($scope, $stateParams) {
   $scope.params = {
      wsid: $stateParams.wsid,
      objid: $stateParams.objid,
      ver: $stateParams.ver
   };
   // handle subobjects, only allowed types!!  This needs to be refactored because it can depend on the base type!!!
   var allowedSubobjectTypes = {'Feature':true};
   
   if ($stateParams.sub && $stateParams.subid) {
      if (allowedSubobjectTypes.hasOwnProperty($stateParams.sub)) {
         $scope.params.sub = {sub:$stateParams.sub,subid:$stateParams.subid};
      }
   }
   
   // Set up the styles for the view.
   // Note that this is the style for all dataview views, as the actual view template
   // is controlled by the router...
    $('<link>')
    .appendTo('head')
    .attr({type: 'text/css', rel: 'stylesheet'})
    .attr('href', 'views/dataview/style.css');

   // Set up the nabar
   require(['kb.widget.navbar'], function (NAVBAR) {
      NAVBAR.clearMenu()
         .clear()
         .addDefaultMenu({
            search: true,
            narrative: true
         });
        


   });
   
   
   $scope.$on('$destroy', function () {
        // remove the postal subscriptions.
        //subs.forEach(function (sub) {
        //    sub.unsubscribe();
        //})
    });
});