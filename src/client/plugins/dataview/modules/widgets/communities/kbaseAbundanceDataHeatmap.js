/**
 * KBase widget to display table of BIOM data
 */
/*jslint
 browser: true,
 white: true
 */
/**
 * KBase widget to display a Metagenome Collection
 */
define([
    'jquery',
    'bluebird',
    'kb.service.workspace',
    'kb.runtime',
    'kb.html',
    'kb_widget_dataview_communities_heatmap',
    // no parameters
    'datatables_bootstrap',
    'kb.jquery.authenticatedwidget'
],
    function ($, Promise, Workspace, R, html, Heatmap) {
        'use strict';
        $.KBWidget({
            name: 'AbundanceDataHeatmap',
            parent: "kbaseAuthenticatedWidget",
            version: '1.0.0',
            token: null,
            options: {
                id: null,
                ws: null,
                rows: 0
            },
            ws_url: R.getConfig('services.workspace.url'),
            init: function (options) {
                this._super(options);
                return this;
            },
            render: function () {
                var self = this;

                var container = this.$elem;
                container.empty();
                if (!R.isLoggedIn()) {
                    container.append("<div>[Error] You're not logged in</div>");
                    return;
                }
                container.append(html.loading('loading data...'));

                var kbws = new Workspace(self.ws_url, {'token': self.token});
                kbws.get_objects([{ref: self.options.ws + "/" + self.options.id}], function (data) {
                    container.empty();
                    // parse data
                    if (data.length === 0) {
                        var msg = "[Error] Object " + self.options.id + " does not exist in workspace " + self.options.ws;
                        container.append('<div><p>' + msg + '>/p></div>');
                    } else {
                        var heatdata = data[0].data;
                        // HEATMAP
                        var heatmapId = html.genId();
                        container.append("<div id='outputHeatmap" + heatmapId + "' style='width: 95%;'></div>");
                        var heatTest = Heatmap.create({
                            target: $("#outputHeatmap" + heatmapId).get(0),
                            data: heatdata
                        });
                        heatTest.render();
                    }
                }, function (data) {
                    container.empty();
                    var main = $('<div>');
                    main.append($('<p>')
                        .css({'padding': '10px 20px'})
                        .text('[Error] ' + data.error.message));
                    container.append(main);
                });
                return self;
            },
            loggedInCallback: function (event, auth) {
                this.token = auth.token;
                this.render();
                return this;
            },
            loggedOutCallback: function (event, auth) {
                this.token = null;
                this.render();
                return this;
            }
        });
    });
