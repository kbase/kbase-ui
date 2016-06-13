/*global
 define
 */
/*jslint
 browser: true,
 white: true
 */
define([
    'jquery',
    'kb/service/client/catalog',
    './catalog_util',
    'kb/widget/legacy/authenticatedWidget',
    'bootstrap',
],
    function ($, Catalog, CatalogUtil) {
        $.KBWidget({
            name: "KBaseCatalogIndex",
            parent: "kbaseAuthenticatedWidget",  // todo: do we still need th
            options: {
            },

            // clients to the catalog service and the NarrativeMethodStore
            catalog: null,
            util: null,

            // main panel and elements
            $mainPanel: null,

            isAdmin: null,

            init: function (options) {
                this._super(options);
                
                var self = this;

                // new style we have a runtime object that gives us everything in the options
                self.runtime = options.runtime;
                self.setupClients();
                self.isAdmin = false;

                // initialize and add the main panel
                var mainPanelElements = self.initMainPanel();
                self.$mainPanel = mainPanelElements[0];
                self.$mainLinks = mainPanelElements[1];
                self.$adminLinks = mainPanelElements[2];
                self.$elem.append(self.$mainPanel);

                self.render();
                self.renderAdminBlock();
                return this;
            },

            render: function() {
                var self = this;
                var $m = self.$mainLinks;
                var base = '#catalog/';


                var descriptionText = 'Browse and search for KBase apps.  This is probably what you are looking for.';
                $m.append($('<h4>').append(self.makeLink(base+'apps', 'App Catalog')))
                  .append($('<div>').append(descriptionText));
                $m.append('<hr>');

                var descriptionText = 'A brief introduction to KBase apps and the App Catalog.';
                $m.append($('<h4>').append(self.makeLink('https://kbase.us/apps', 'App Catalog Help Pages')))
                  .append($('<div>').append(descriptionText));
                $m.append('<hr>');


                descriptionText = 'View registered KBase Modules.  Modules are groups of related Apps, code, functions, data and other components'
                                    + ' registered from a single git repository by developers using the KBase SDK.';
                $m.append($('<h4>').append(self.makeLink(base+'modules', 'Module Catalog')))
                  .append($('<div>').append(descriptionText));
                $m.append('<hr>');


                descriptionText = '(for developers) Browse and search for functions that you can call from your code.  Think of these functions as your KBase API library that anyone can contribute to.'
                $m.append($('<h4>').append(self.makeLink(base+'functions', 'Function Catalog')))
                  .append($('<div>').append(descriptionText));
                $m.append('<hr>');


                descriptionText = '(for developers) View low-level data type schemas and specifications.  In general, don\'t operate on these schemas directly in your code because they will '
                                    + 'change.  Instead find an appropriate function to get and save data using a standard file format.';
                $m.append($('<h4>').append(self.makeLink(base+'datatypes', 'Data Type Catalog')))
                  .append($('<div>').append(descriptionText));
                $m.append('<hr>');


                descriptionText = '(for developers) Browse and manage KBase web services, which you should only be using for interactive browser'
                                    + ' visualizations.  For SDK-built Apps, take a look at the Functions instead.';
                $m.append($('<h4>').append(self.makeLink(base+'services', 'Web Service Status and Management')))
                  .append($('<div>').append(descriptionText));
                $m.append('<hr>');


                descriptionText = '(for developers) Register new Modules built with the KBase SDK.  Use this page only for your first registration.'
                                    + '  After that, go to your Module page to access developer tools.';
                $m.append($('<h4>').append(self.makeLink(base+'register', 'New Module Registration Page')))
                  .append($('<div>').append(descriptionText));
                $m.append('<hr>');


                descriptionText = 'View the current status of the KBase Catalog Service, such as recent module registrations.';
                $m.append($('<h4>').append(self.makeLink(base+'status', 'Catalog Status')))
                  .append($('<div>').append(descriptionText));
                $m.append('<hr>');


                descriptionText = 'View summary statistics of KBase Apps.';
                $m.append($('<h4>').append(self.makeLink(base+'stats', 'Catalog Stats')))
                  .append($('<div>').append(descriptionText));
                $m.append('<hr>');


                descriptionText = '(for developers) Learn and get the tools for building your own KBase Modules, Apps, Services, and Functions.';
                $m.append($('<h4>').append(self.makeLink('https://github.com/kbase/kb_sdk', 'KBase SDK')))
                  .append($('<div>').append(descriptionText));
                $m.append('<hr>');

            },

            makeLink: function(url, name) {
                return $('<a href="'+url+'">').append(name);
            },

            renderAdminBlock: function() {
                var self = this;
                // make sure we are an admin
                var loadingCalls = [];
                loadingCalls.push(self.checkIsAdmin());

                // when we have it all, then render the list
                Promise.all(loadingCalls).then(function() {
                    if(self.isAdmin) {

                        var $a = self.$adminLinks;
                        var base = '#catalog/';

                        var descriptionText = 'You must be a Catalog administrator.  You should know what you\'re doing.';
                        $a.append($('<h4>').append(self.makeLink(base+'admin', 'Catalog Administration')))
                          .append($('<div>').append(descriptionText));
                        $a.append('<hr>');

                    }
                });
            },


            setupClients: function() {
                this.catalog = new Catalog(
                    this.runtime.getConfig('services.catalog.url'),
                    { token: this.runtime.service('session').getAuthToken() }
                );
            },

            initMainPanel: function($appListPanel, $moduleListPanel) {
                var $mainPanel = $('<div>').addClass('container');

                var $adminLinks =  $('<div>');
                $mainPanel.append($adminLinks);

                var $mainLinks =  $('<div>');
                $mainPanel.append($mainLinks);

                return [$mainPanel, $mainLinks, $adminLinks];
            },

            checkIsAdmin: function() {
                var self = this
                var me = self.runtime.service('session').getUsername();
                return self.catalog.is_admin(me)
                    .then(function (result) {
                        if(result) { self.isAdmin = true; }
                    })
                    .catch(function (err) {
                        console.error('ERROR');
                        console.error(err);
                    });
            }
        });
    });



