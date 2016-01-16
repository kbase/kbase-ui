// This is main.js
define('jquery', [], function () {
   return jQuery;
});
define('kb_clients', [], function () {
   return 'KBCLIENTS DUMMY OBJECT';
});
//NB underscore, as of 1.6, inclues AMD compatible loading. However, other parts of the kbase
// codebase may rely on underscore being loaded globally, so se just use the global version, which 
// must already be loaded.
define('underscore', [], function () {
   return _;
});
var kbClients = [
   ['narrative_method_store', 'NarrativeMethodStore'],
   ['user_profile', 'UserProfile'],
   ['workspace', 'Workspace']
];
// NB need the immediate function exec below in order to avoid
// variable capture problem with anon funcs.
for (var i in kbClients) {
   define('kb.client.'+kbClients[i][0], [], (function (client) {
      return function () {
         return client;
      };
   })(window[kbClients[i][1]]));
      
}

define('postal', [], function () {
   return postal;
});
define('q', [], function () {
   return Q;
});
require.config({
   baseUrl: '/search/',
   catchError: true,
   onError: function (err) {
      alert("Error:" + err);
   },
   paths: {
      Q: '../assets/js/q.min',
      nunjucks: '../modules/bower_components/nunjucks/nunjucks',
      md5: 'src/md5',
      lodash: '../modules/bower_components/lodash/lodash',
      'postal.request-response': '/ext/postal/postal.request-response.min',
      postaldeluxe: 'src/postal/postal-deluxe',

      domReady: '../modules/bower_components/requirejs-domready/domReady',
      text: '../modules/bower_components/requirejs-text/text',
      json: '../modules/bower_components/requirejs-json/json',
      
      // kbase utils
      'kb.utils': 'src/kbaseUtils',
      'kb.cookie': 'src/kbaseCookie',
      'kb.test': 'src/kbaseTest',
      'kb.utils.api': 'src/kbaseAPIUtils',
      'kb.alert': 'src/widgets/kbaseAlert',
      'kb.asyncqueue': 'src/kbaseAsyncQueue',
      'kb.statemachine': 'src/kbaseStateMachine',  
      'kb.logger': 'src/kbaseLogger',
      
      // kbase app
      'kb.appstate': 'src/kbaseAppState',

      // widgets
      'kb.widget.buttonbar': 'src/widgets/kbaseButtonbar',
      'kb.widget.social.base': 'src/widgets/social/kbaseSocialWidget',
      'kb.user_profile': 'src/kbaseUserProfile',
      'kb.widget.social.user_profile': 'src/widgets/social/kbaseUserProfileWidget',
      'kb.widget.social.user_search': 'src/widgets/social/kbaseUserSearch',
      'kb.widget.social.browse_narratives': 'src/widgets/social/kbaseUserBrowseNarratives',
      'kb.widget.social.collaborators': 'src/widgets/social/kbaseUserCollaboratorNetwork',
      
      'kb.session': 'src/kbaseSession',
      'kb.config': 'src/kbaseConfig',
      'kb.widget.navbar': 'src/widgets/kbaseNavbar',
      'kb.widget.base': 'src/widgets/kbaseBaseWidget',
      'kb.widget.login': 'src/widgets/kbaseLoginWidget',
      
      // Dashboard widgets
      'kb.widget.dashboard.base': 'src/widgets/dashboard/DashboardWidget',
      'kb.widget.dashboard.profile': 'src/widgets/dashboard/ProfileWidget',
      'kb.widget.dashboard.sharedNarratives': 'src/widgets/dashboard/SharedNarrativesWidget',
      'kb.widget.dashboard.narratives': 'src/widgets/dashboard/NarrativesWidget',
      'kb.widget.dashboard.publicNarratives': 'src/widgets/dashboard/PublicNarrativesWidget',
      'kb.widget.dashboard.apps': 'src/widgets/dashboard/AppsWidget',
      'kb.widget.dashboard.data': 'src/widgets/dashboard/DataWidget',
      'kb.widget.dashboard.collaborators': 'src/widgets/dashboard/CollaboratorsWidget', 
      'kb.widget.dashboard.metrics': 'src/widgets/dashboard/MetricsWidget',
      
      // Dataview widgets
      'kb.widget.dataview.base': 'src/widgets/dataview/DataviewWidget',
      'kb.widget.dataview.overview': 'src/widgets/dataview/OverviewWidget',
      
      // KBase clients. Wrappers around the service clients to provide packaged operations with promises.
      'kb.client.workspace': 'src/clients/kbaseWorkspaceClient',
      'kb.client.methods': 'src/clients/kbaseClientMethods'
   },
   shim: {
      // Better standard naming: Prefix with kbc_ (KBase Client), followed
      // by the global object / base filename the client lib.
     
      q: {
         exports: 'Q'
      }
   }


});