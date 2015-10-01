/*global
 define
 */
/*jslint
 browser: true,
 white: true
 */
/**
 * Abstract class to provide basid visualization for a single object.
 *
 * getDataModel function needs to be implemeted in the descendents of this class
 *
 * Pavel Novichkov <psnovichkov@lbl.gov>
 * @public
 */
define(['jquery', 'kb.jquery.authenticatedwidget', 'kb.service.workspace', 'kb.runtime', 'kb.html'],
    function ($, _AuthenticatedWidget, Workspace, R, html) {
        'use strict';
        $.KBWidget({
            name: 'kbaseSingleObjectBasicWidget',
            parent: 'kbaseAuthenticatedWidget',
            version: '1.0.1',
            options: {
                objId: null,
                workspaceId: null,
                objVer: null
            },
            init: function (options) {
                this._super(options);

                this.options.landingPageURL = "#/dataview/";
                this.workspaceURL = R.getConfig('services.workspace.url');

                this.$errorPane = $('<div>').addClass('alert alert-danger').hide();
                this.$elem.append(this.$errorPane);

                this.$messagePane = $('<div>');
                this.$elem.append(this.$messagePane);

                this.$mainPane = $("<div>");
                this.$elem.append(this.$mainPane);

                return this;
            },
            loggedInCallback: function (event, auth) {

                // Cretae a new workspace client
                this.ws = new Workspace(this.workspaceURL, auth);

                // Let's go...
                this.render();

                return this;
            },
            loggedOutCallback: function (event, auth) {
                this.ws = null;
                this.isLoggedIn = false;
                return this;
            },
            render: function () {

                var self = this;
                self.loading(true);

                // Get object
                var identityObj = self.buildObjectIdentity(self.options.workspaceId, self.options.objId, self.options.objVer);
                this.ws.get_objects([identityObj],
                    function (d) {
                        self.loading(false);
                        self.buildWidgetContent(d[0].data);
                    },
                    function (error) {
                        self.loading(false);
                        self.showError(error);
                    }
                );
            },
            buildWidgetContent: function (objData) {
                var $container = this.$mainPane;
                var dataModel = this.getDataModel(objData);

                $container.append(dataModel.description);

                // Build a table                    
                var $table = $('<table class="table table-striped table-bordered" />')
                    .css('width', '100%')
                    .css('margin', ' 1em 0 0 0');
                $container.append($table);

                for (var i = 0; i < dataModel.items.length; i++) {
                    var item = dataModel.items[i];
                    if (item.header) {
                        $table.append(this.makeHeaderRow(item.name, item.value));
                    } else {
                        $table.append(this.makeRow(item.name, item.value));
                    }
                }
            },
            getDataModel: function (objData) {
                // Example of the data model
                return {
                    description: "Example description for the object: " + JSON.stringify(objData),
                    items: [
                        {name: "name1", value: "value1"},
                        {name: "name2", value: "value2"},
                        {header: "1", name: "Group title 2"},
                        {name: "name2.1", value: "value2.1"},
                        {name: "name2.2", value: "value2.2"},
                    ]
                };
            },
            makeHeaderRow: function (name) {
                return $("<tr/>")
                    .append(
                        $("<td colspan='2'/>")
//                  .css('background-color','#f9f9f9')
//                  .css('font-size', '1.1em')
//                  .css('font-weight', 'bold')
                        .append($('<b />').append(name))
                        );
            },
            makeRow: function (name, value) {
                return $("<tr/>")
                    .append($("<th />").css('width', '20%').append(name))
                    .append($("<td />").append(value));
            },
            /*
             getData: function() {
             return {
             type: 'AssemblyInput',
             id: this.options.objId,
             workspace: this.options.workspaceId,
             title: 'Domain Annotation'
             };
             },
             */
            loading: function (isLoading) {
                if (isLoading)
                    this.showMessage(html.loading());
                else
                    this.hideMessage();
            },
            showMessage: function (message) {
                var span = $("<span/>").append(message);

                this.$messagePane.append(span);
                this.$messagePane.show();
            },
            hideMessage: function () {
                this.$messagePane.hide();
                this.$messagePane.empty();
            },
            buildObjectIdentity: function (workspaceID, objectID, objectVer, wsRef) {
                var obj = {};
                if (wsRef) {
                    obj['ref'] = wsRef;
                } else {
                    if (/^\d+$/.exec(workspaceID))
                        obj['wsid'] = workspaceID;
                    else
                        obj['workspace'] = workspaceID;

                    // same for the id
                    if (/^\d+$/.exec(objectID))
                        obj['objid'] = objectID;
                    else
                        obj['name'] = objectID;

                    if (objectVer)
                        obj['ver'] = objectVer;
                }
                return obj;
            },
            showError: function (error) {
                this.$errorPane.empty();
                this.$errorPane.append('<strong>Error when retrieving data.</strong><br><br>');
                this.$errorPane.append(error.error.message);
                this.$errorPane.append('<br>');
                this.$errorPane.show();
            }
        });
    });


